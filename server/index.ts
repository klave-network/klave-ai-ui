import '@total-typescript/ts-reset';
import type { Server } from 'node:net';
import type { Plugin } from 'vite';
import http from 'node:http';
import https from 'node:https';
import viteMkcert from 'vite-plugin-mkcert';
import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { MongoClient, ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs

type OCROuputSuccess = {
    file_type: string;
    filename: string;
    text: string;
}

type OCROuputError = {
    error: string;
}

type OCROuput = OCROuputSuccess | OCROuputError;

const isOCROuputSuccess = (output: OCROuput): output is OCROuputSuccess => {
    return (output as OCROuputSuccess).text !== undefined;
}

const __dirname = path.resolve();
const app = express();
const port = 3446;
// const host = 'localhost';
const host = 'demo.ai.filer.127.0.0.1.sslip.io';
const db = new MongoClient("mongodb://localhost:27017").db('filer');
const filesCollection = db.collection("files");
const setsCollection = db.collection("sets");

const regex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(.+)/i;

// Use CORS middleware to allow cross-origin requests
app.use(cors());
app.use(express.json());

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, "uploads");
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4()); // Include UUID in the filename
    },
});

// Create the multer instance
const upload = multer({ storage: storage });

// Set up a route for file uploads
app.post("/upload", upload.single("file"), async (req, res) => {

    const { file } = req;
    if (!file) {
        res.status(400).json({ message: "No file uploaded!" });
        return;
    }
    let insertedId: ObjectId | undefined = undefined;
    try {
        const newRecord = {
            uuid: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            dateUploaded: new Date(),
            status: "uploaded",
        };
        const inserted = await filesCollection.insertOne(newRecord);
        insertedId = inserted.insertedId;
        res.status(200).json({
            message: "File uploaded successfully.",
            file: newRecord

        })
    } catch (error) {
        console.error("Error inserting file into database:", error);
        res.status(500).json({ message: "Error uploading file." });
        return;
    }

    setTimeout(async () => {
        let ocrOutput: OCROuput | undefined = undefined;
        try {
            const formData = new FormData()
            const filePath = path.join(file.destination, file.filename);
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const fileBytesArray = await fs.createReadStream(filePath).toArray()
            const fileBlob = new Blob(fileBytesArray, {
                type: file.mimetype || "application/octet-stream"
            })

            formData.append('file', fileBlob, `${file.filename}.${fileExtension}`)
            const response = await fetch('https://cuyegue.secretivecomputing.tech:15000/upload', {
                method: 'POST',
                body: formData,
            })

            ocrOutput = await response.json() as OCROuput;
            console.log("OCR Output:", ocrOutput);
        } catch (error) {
            console.error("Error during OCR processing:", error);
            return;
        }
        if (!isOCROuputSuccess(ocrOutput) || !ocrOutput?.text) {
            try {
                await filesCollection.updateOne({
                    _id: insertedId
                }, {
                    $set: {
                        status: "error",
                        ocrError: `OCR processing failed or returned no text. ${(ocrOutput as any).error ?? "Unknown error"}`
                    }
                });
            } catch (error) {
                console.error("Error inserting file into database:", error);
            }
            return;
        }
        try {
            await filesCollection.updateOne({
                _id: insertedId
            }, {
                $set: {
                    status: "processed",
                    ocrOutput: ocrOutput.text,
                }
            });
        } catch (error) {
            console.error("Error inserting file into database:", error);
        }
    }, 200);
});

app.get("/files", (req, res) => {

    filesCollection.find().toArray().then(files => {
        res.json({ files });
    }).catch(error => {
        console.error("Error fetching files from database:", error);
        res.status(500).json({ message: "Error fetching files." });
    });

    // const directoryPath = path.join(__dirname, "uploads");

    // const { pageSize: oPageSize, page: oPage, sortField: oSortField, sortOrder: oSortOrder } = req.query;
    // const pageSize = parseInt(typeof oPageSize === "string" ? oPageSize : "", 10) || 10;
    // const page = parseInt(typeof oPage === "string" ? oPage : "", 10) || 0;
    // const sortField = typeof oSortField === "string" ? oSortField : "dateUploaded";
    // const sortOrder = typeof oSortOrder === "string" ? oSortOrder : "asc";

    // // Read the files from the directory
    // fs.readdir(directoryPath, (err, files) => {
    //     if (err) {
    //         return res.status(500).json({
    //             message: "Unable to scan files!",
    //         });
    //     }

    //     // Create an array of file details with unique ID and creation date
    //     let fileList = files.map((file) => {
    //         const filePath = path.join(directoryPath, file);
    //         const stats = fs.statSync(filePath);

    //         const match = file.match(regex);

    //         const id = match ? match[1] : null;
    //         const extractedFileName = match ? match[2].trim() : file;

    //         return {
    //             id,
    //             filename: extractedFileName,
    //             size: stats.size,
    //             dateUploaded: stats.birthtime.toISOString(),
    //         };
    //     });

    //     // Apply sorting based on the requested sortField and sortOrder
    //     fileList = fileList.sort((a, b) => {
    //         const valueA = a[sortField as keyof typeof a];
    //         const valueB = b[sortField as keyof typeof b];
    //         if (valueA === undefined || valueB === undefined) {
    //             return 0; // If either value is undefined, consider them equal
    //         } else if (valueA === null || valueB === null) {
    //             return valueA === null ? 1 : -1; // Place null values at the end
    //         }
    //         if (sortOrder === "asc") {
    //             return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    //         } else {
    //             return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    //         }
    //     });

    //     const totalFilesCount = fileList.length;
    //     const startIndex = page * pageSize;
    //     const endIndex = startIndex + pageSize;

    //     const paginatedFiles = fileList.slice(startIndex, endIndex);

    //     res.json({ totalFilesCount, files: paginatedFiles });
    // });
});

app.delete("/files", (req, res) => {

    const fileIds = req.body.fileIds; // Expecting an array of file IDs
    const directoryPath = path.join(__dirname, "uploads");

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
        res.status(400).json({ message: "Invalid file IDs." });
        return
    }

    // List files to find the correct ones to delete
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({
                message: "Unable to scan files!",
            });
        }

        const filesToDelete = fileIds
            .map((fileId) => {
                return files.find((file) => {
                    const match = file.match(regex);
                    return match && match[1] === fileId; // Compare the UUIDs
                });
            })
            .filter(Boolean); // Remove undefined values if no match is found

        if (filesToDelete.length === 0) {
            return res.status(404).json({ message: "No files found." });
        }

        let deletionCount = 0;

        // Delete the matched files
        filesToDelete.forEach((fileToDelete) => {
            const filePath = path.join(directoryPath, fileToDelete);
            fs.unlink(filePath, (err) => {
                if (err) {
                    return res.status(500).json({
                        message: `Unable to delete file: ${fileToDelete}.`,
                    });
                }

                deletionCount++;
                if (deletionCount === filesToDelete.length) {
                    res.json({
                        message: `${deletionCount} file(s) deleted successfully.`,
                    });
                }
            });
        });
    });
});

app.get("/files/:id", (req, res) => {
    const fileId = req.params.id;
    const directoryPath = path.join(__dirname, "uploads");

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: "Unable to scan files!" });
        }

        const file = files.find((file) => {
            const match = file.match(regex);
            return match && match[1] === fileId;
        });
        if (!file) {
            return res.status(404).json({ message: "File not found!" });
        }

        const match = file.match(regex);
        const originalFilename = match ? match[2].trim() : file;

        // Serve the file with the correct filename in the Content-Disposition header
        const filePath = path.join(directoryPath, file);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${originalFilename}"`
        );
        res.sendFile(filePath);
    });
});

app.get("/sets", async (req, res) => {
    const { user } = req.query;
    if (!user) {
        res.status(400).json({ message: "User parameter is required." });
        return;
    }
    try {
        const sets = await setsCollection.find({
            user
        }).toArray();
        res.json({ sets });
    } catch (error) {
        console.error("Error fetching sets from database:", error);
        res.status(500).json({ message: "Error fetching sets." });
    }
});

app.post("/sets", async (req, res) => {
    const { user } = req.query;
    const set = req.body;
    if (!set) {
        res.status(400).json({ message: "Invalid set data." });
        return;
    }
    try {
        const newSet = {
            ...set,
            user,
            uuid: uuidv4(),
            dateCreated: new Date(),
        };
        await setsCollection.insertOne(newSet);
        res.status(201).json({ message: "Set created successfully.", set: newSet });
    } catch (error) {
        console.error("Error inserting set into database:", error);
        res.status(500).json({ message: "Error creating set." });
    }
});

app.delete("/sets", async (req, res) => {
    const { setIds } = req.body;

    if (!Array.isArray(setIds) || setIds.length === 0) {
        res.status(400).json({ message: "Invalid set IDs." });
        return;
    }

    try {
        const result = await setsCollection.deleteMany({
            uuid: { $in: setIds }
        });

        if (result.deletedCount > 0) {
            res.json({ message: `${result.deletedCount} set(s) deleted successfully.` });
        } else {
            res.status(404).json({ message: "No sets found." });
        }
    } catch (error) {
        console.error("Error deleting sets from database:", error);
        res.status(500).json({ message: "Error deleting sets." });
    }
});

let protocol = 'http';
let serverContainer: Server | undefined = undefined;
const httpsise = async () => {
    try {
        const vitePlugin = (viteMkcert({
            keyFileName: 'demo-ai-filer-dev-key.pem',
            certFileName: 'demo-ai-filer-dev-cert.pem',
            hosts: [host, 'localhost'],
        }) as unknown as Plugin);
        if (vitePlugin && typeof vitePlugin.config === 'function') {
            const vitePluginConfig = await vitePlugin.config({
                logLevel: 'silent'
            }, {
                mode: 'detached',
                command: 'serve'
            });
            if (!vitePluginConfig?.server?.https)
                return;
            serverContainer = https.createServer({
                key: vitePluginConfig.server.https.key,
                cert: vitePluginConfig.server.https.cert
            }, app);
            protocol = 'https';
        } else {
            serverContainer = http.createServer({}, app);
        }
    } catch (error) {
        console.error("Error setting up HTTPS server:", error);
        process.exit(1);
    }
}

httpsise()
    .then(() => {
        if (!serverContainer) {
            return process.on('SIGINT', () => {
                console.log("Shutting down server...");
                process.exit(0);
            });
        }

        serverContainer.on('error', (error) => {
            console.error(error);
            process.exit(1);
        });

        serverContainer.listen(port, host, () => {
            console.info(`Listening at ${protocol}://${host}:${port}`);
        });
    });