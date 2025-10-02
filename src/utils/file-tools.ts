import { crypto, Utils } from '@secretarium/connector';
import prettyBytes from 'pretty-bytes';

const maxFileSize = Number.parseInt(import.meta.env.REACT_APP_SFX_MAX_FILE_SIZE ?? '102500000');

function getRandomUint8Array(size = 32): Uint8Array {
    const a = new Uint8Array(size);
    crypto.getRandomValues(a);
    return a;
}

export type FileRecord = {
    name: string;
    digest: string;
    type: string;
    size: number;
    token?: string;
    src?: string;
    key?: string;
    downloadUrl?: string;
    content?: string;
    encryptedBlob?: Blob;
};

export async function prepareFile(file: File): Promise<FileRecord> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onabort = (): void => { };
        reader.onerror = (): void => { };
        reader.onload = async (): Promise<void> => {
            if (reader.result) {
                try {
                    const content = new Uint8Array(reader.result as ArrayBuffer);

                    if (content.length > maxFileSize)
                        return reject(new Error(`File is too large. UAT file size is limited to ${prettyBytes(maxFileSize)}`));

                    const iv = getRandomUint8Array(12);
                    const pwd = getRandomUint8Array(32);
                    const aesgcmKey = await crypto.subtle!.importKey('raw', pwd, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
                    const encryptedContent = await crypto.subtle!.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, aesgcmKey, content);
                    const hash = Utils.toBase64(new Uint8Array(await Utils.hash(encryptedContent)));
                    const originalBlob = new Blob([content], { type: file.type });
                    const originalDataURL = URL.createObjectURL(originalBlob);
                    const encryptedBlob = new Blob([encryptedContent], { type: 'application/octet-stream' });

                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        key: `${Utils.toBase64(iv)}#${Utils.toBase64(pwd)}`,
                        src: 'Walang',
                        digest: hash,
                        downloadUrl: originalDataURL,
                        encryptedBlob
                    });
                }
                catch (error) {
                    reject(error);
                }
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

export async function loadFile(file: FileRecord, withContent?: boolean, contentAs: 'text' | 'base64' = 'base64'): Promise<FileRecord> {
    const result = {
        ...file
    };

    const encryptedFile = await fetch(`/api/file`, {
        method: 'GET',
        headers: {
            Authorization: `klavedr=${file.token}`
        }
    }).then(async (result) => {
        const isJson = result.headers.get('content-type')?.toLocaleLowerCase().includes('application/json');
        if (isJson) {
            const response = await result.json();
            if (!response.success)
                throw response.message;
        }
        return result;
    });

    const key = file?.key?.split('#');

    if (key?.length === 2) {
        const encryptedOriginalBuffer = await encryptedFile.arrayBuffer();
        const originalIv = Utils.fromBase64(key[0]);
        const originalPwd = Utils.fromBase64(key[1]);
        const originalAesgcmKey = await crypto.subtle!.importKey('raw', originalPwd, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
        const decryptedOriginalBuffer = await crypto.subtle!.decrypt({ name: 'AES-GCM', iv: originalIv, tagLength: 128 }, originalAesgcmKey, encryptedOriginalBuffer);
        const decryptedOriginalBlob = new Blob([decryptedOriginalBuffer], { type: file.type });
        const originalDataURL = URL.createObjectURL(decryptedOriginalBlob);
        result.downloadUrl = originalDataURL;
        if (withContent) {
            if (contentAs === 'text') {
                result.content = await decryptedOriginalBlob.text();
            }
            else {
                // base64
                result.content = await new Promise<string>((resolve, reject) => {
                    const fr = new FileReader();
                    fr.onload = () => {
                        const dataUrl = fr.result as string;
                        resolve(dataUrl.split(',')[1] || '');
                    };
                    fr.onerror = () => reject(new Error('Failed to read decrypted blob as base64'));
                    fr.readAsDataURL(decryptedOriginalBlob);
                });
            }
        }
    }

    return result;
}
