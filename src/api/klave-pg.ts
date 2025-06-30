import secretariumHandler from '@/lib/secretarium-handler';
import { klaveKlaveAIContract, waitForConnection } from '@/api';
import { type PgsqlCreateInput } from '@/lib/types';

export const pgsqlCreate = async (args: PgsqlCreateInput): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'pgsql_create',
                args,
                `pgsql_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const pgsqlList = async (): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'pgsql_list',
                '',
                `pgsql_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
