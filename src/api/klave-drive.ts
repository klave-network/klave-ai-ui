import type {
    ApproveUserRequestInput,
    DriveContentResult,
    GetFileUploadTokenInput,
    GetFileUploadTokenResult,
    GetUserContentResult,
    ListDrivesResult,
    ListUserRequestsResult,
    SetIdentitiesInput,
    TokenIdentityResult,
    TransactionResult,
    UpdateDriveInput,
    UserRequestInput
} from '@/lib/types';

import { KLAVE_AI_DRIVE_FQDN, KLAVE_AI_DRIVE_NODE } from '@/lib/constants';
import secretariumHandler from '@/lib/secretarium-handler';

export function waitForConnection() {
    return new Promise<void>((resolve) => {
        const loopCondition = () => {
            const isConnected = secretariumHandler.isConnected(KLAVE_AI_DRIVE_NODE);
            if (isConnected)
                resolve();
            else setTimeout(loopCondition, 1000);
        };
        loopCondition();
    });
}

export async function createSuperAdmin(): Promise<TransactionResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(KLAVE_AI_DRIVE_FQDN, 'createSuperAdmin', {}, `createSuperAdmin-${Math.random()}`, KLAVE_AI_DRIVE_NODE)
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function createUser(input: UserRequestInput): Promise<TransactionResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(KLAVE_AI_DRIVE_FQDN, 'createUserRequest', input, `createUser-${Math.random()}`, KLAVE_AI_DRIVE_NODE)
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function getUser(): Promise<GetUserContentResult> {
    return waitForConnection()
        .then(() => secretariumHandler.request(KLAVE_AI_DRIVE_FQDN, 'getUserContent', {}, `getUser-${Math.random()}`, KLAVE_AI_DRIVE_NODE))
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        console.log(result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function listUsers(): Promise<ListUserRequestsResult> {
    return waitForConnection()
        .then(() => secretariumHandler.request(KLAVE_AI_DRIVE_FQDN, 'listUserRequests', {}, `listUsers-${Math.random()}`, KLAVE_AI_DRIVE_NODE))
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function approveUser(input: ApproveUserRequestInput): Promise<TransactionResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(KLAVE_AI_DRIVE_FQDN, 'approveUserRequest', input, `approveUser-${Math.random()}`, KLAVE_AI_DRIVE_NODE)
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function resetIdentities(input: SetIdentitiesInput): Promise<TransactionResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(KLAVE_AI_DRIVE_FQDN, 'resetIdentities', input, `resetIdentities-${Math.random()}`, KLAVE_AI_DRIVE_NODE)
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function exportStorageServerPrivateKey(format?: string): Promise<TransactionResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_DRIVE_FQDN,
                'exportStorageServerPrivateKey',
                { format },
                `exportStorageServerPrivateKey-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function setTokenIdentity(token?: string): Promise<TransactionResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_DRIVE_FQDN,
                'setTokenIdentity',
                { token },
                `setTokenIdentity-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function createDrive(): Promise<TransactionResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_DRIVE_FQDN,
                'createDrive',
                { driveId: '' },
                `createDrive-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function updateDrive(input: UpdateDriveInput): Promise<TransactionResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(KLAVE_AI_DRIVE_FQDN, 'updateDrive', input, `updateDrive-${Math.random()}`, KLAVE_AI_DRIVE_NODE)
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function getPublicKeys(): Promise<TokenIdentityResult> {
    return waitForConnection()
        .then(() => secretariumHandler.request(KLAVE_AI_DRIVE_FQDN, 'getPublicKeys', {}, `getPublicKeys-${Math.random()}`, KLAVE_AI_DRIVE_NODE))
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function getFileUploadToken(getFileUploadTokenInput: GetFileUploadTokenInput): Promise<GetFileUploadTokenResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_DRIVE_FQDN,
                'getFileUploadToken',
                getFileUploadTokenInput,
                `getFileUploadToken-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function listDrives(): Promise<ListDrivesResult> {
    return waitForConnection()
        .then(() => secretariumHandler.request(KLAVE_AI_DRIVE_FQDN, 'listDrives', {}, `listDrives-${Math.random()}`, KLAVE_AI_DRIVE_NODE))
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function getDriveContent(driveId: string): Promise<DriveContentResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_DRIVE_FQDN,
                'getDriveContent',
                { driveId },
                `getDriveContent-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

// -------------------- MOCK WEB SERVER --------------------

const mock_web_server_klave_contract = 'test_sdk_smart_contract';

function rmPemDecorators(pemFile: string, type: string) {
    pemFile = pemFile.replace(`-----BEGIN ${type} KEY-----`, '');
    pemFile = pemFile.replace(`-----END ${type} KEY-----`, '');
    pemFile = pemFile.replace(/\n/g, '');
    pemFile = pemFile.replace(/\r/g, '');
    return pemFile;
}

export async function setStorageServerTokenIdentity(pem: string): Promise<TransactionResult> {
    return waitForConnection()
        .then(() => {
            const pemContents = rmPemDecorators(pem, 'EC PRIVATE');
            const importKeyInput = {
                keyName: 'storageServerPrivateKey',
                key: {
                    format: 'pkcs8',
                    keyData: pemContents,
                    algorithm: 'secp256r1',
                    extractable: false,
                    usages: ['sign']
                }
            };

            return secretariumHandler.request(
                mock_web_server_klave_contract,
                'importKey',
                importKeyInput,
                `importKey-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            );
        })
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

// export const importPrivateKey = async (pem: string): Promise<TransactionResult> =>
//     waitForConnection()
//         .then(() => {
//             const pemContents = rmPemDecorators(pem, 'EC PRIVATE');
//             const importKeyInput = {
//                 keyName: 'webServerPrivateKey',
//                 key: {
//                     format: 'sec1',
//                     keyData: pemContents,
//                     algorithm: 'secp256r1',
//                     extractable: true,
//                     usages: ['sign']
//                 }
//             };

//             return secretariumHandler.request(
//                 mock_web_server_klave_contract,
//                 'importKey',
//                 importKeyInput,
//                 `importKey-${Math.random()}`
//             );
//         })
//         .then(
//             (tx) =>
//                 new Promise((resolve, reject) => {
//                     tx.onResult((result) => {
//                         resolve(result);
//                     });
//                     tx.onError((error) => {
//                         reject(error);
//                     });
//                     tx.send().catch(reject);
//                 })
//         );

export async function getPublicKey(keyName: string): Promise<TransactionResult> {
    return waitForConnection()
        .then(() => {
            const getPublicKeyInput = {
                keyName,
                format: 'spki'
            };

            return secretariumHandler.request(
                mock_web_server_klave_contract,
                'getPublicKey',
                getPublicKeyInput,
                `getPublicKey-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            );
        })
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function importPublicKey(pem: string): Promise<TransactionResult> {
    return waitForConnection()
        .then(() => {
            const pemContents = rmPemDecorators(pem, 'PUBLIC');
            const importKeyInput = {
                keyName: 'klaveServerPublicKey',
                key: {
                    format: 'spki',
                    keyData: pemContents,
                    algorithm: 'secp256r1',
                    extractable: true,
                    usages: ['verify']
                }
            };

            return secretariumHandler.request(
                mock_web_server_klave_contract,
                'importKey',
                importKeyInput,
                `importKey-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            );
        })
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function sign(keyName: string, clearText: string): Promise<TransactionResult> {
    return waitForConnection()
        .then(() => {
            const signInput = {
                keyName,
                clearText
            };

            return secretariumHandler.request(
                mock_web_server_klave_contract,
                'sign',
                signInput,
                `sign-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            );
        })
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function verify(keyName: string, clearText: string, signatureB64: string): Promise<TransactionResult> {
    return waitForConnection()
        .then(() => {
            const verifyInput = {
                keyName,
                clearText,
                signatureB64
            };

            return secretariumHandler.request(
                mock_web_server_klave_contract,
                'verify',
                verifyInput,
                `verify-${Math.random()}`,
                KLAVE_AI_DRIVE_NODE
            );
        })
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}
