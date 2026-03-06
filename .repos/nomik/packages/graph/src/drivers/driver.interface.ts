import type { GraphConfig } from '@nomik/core';
import type { Session } from 'neo4j-driver';

export interface GraphDriver {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getSession(): Session;
    isConnected(): boolean;
    runQuery<T = unknown>(cypher: string, params?: Record<string, unknown>): Promise<T[]>;
    runWrite(cypher: string, params?: Record<string, unknown>): Promise<void>;
    healthCheck(): Promise<boolean>;
}

export interface GraphDriverFactory {
    create(config: GraphConfig): GraphDriver;
}
