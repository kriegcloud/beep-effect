import type { GraphDriver } from '../drivers/driver.interface.js';

/** Contraintes et index pour le schema Neo4j */
const SCHEMA_INIT = [
    // Contraintes d'unicite
    'CREATE CONSTRAINT file_id IF NOT EXISTS FOR (f:File) REQUIRE f.id IS UNIQUE',
    'CREATE CONSTRAINT function_id IF NOT EXISTS FOR (f:Function) REQUIRE f.id IS UNIQUE',
    'CREATE CONSTRAINT class_id IF NOT EXISTS FOR (c:Class) REQUIRE c.id IS UNIQUE',
    'CREATE CONSTRAINT route_id IF NOT EXISTS FOR (r:Route) REQUIRE r.id IS UNIQUE',
    'CREATE CONSTRAINT module_id IF NOT EXISTS FOR (m:Module) REQUIRE m.id IS UNIQUE',
    'CREATE CONSTRAINT variable_id IF NOT EXISTS FOR (v:Variable) REQUIRE v.id IS UNIQUE',
    'CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE',
    // Contraintes pour les types de noeuds futurs (pre-provisionnees)
    'CREATE CONSTRAINT dbtable_id IF NOT EXISTS FOR (d:DBTable) REQUIRE d.id IS UNIQUE',
    'CREATE CONSTRAINT dbcolumn_id IF NOT EXISTS FOR (d:DBColumn) REQUIRE d.id IS UNIQUE',
    'CREATE CONSTRAINT externalapi_id IF NOT EXISTS FOR (e:ExternalAPI) REQUIRE e.id IS UNIQUE',
    'CREATE CONSTRAINT cronjob_id IF NOT EXISTS FOR (c:CronJob) REQUIRE c.id IS UNIQUE',
    'CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE',
    'CREATE CONSTRAINT envvar_id IF NOT EXISTS FOR (e:EnvVar) REQUIRE e.id IS UNIQUE',
    'CREATE CONSTRAINT queuejob_id IF NOT EXISTS FOR (q:QueueJob) REQUIRE q.id IS UNIQUE',
    'CREATE CONSTRAINT metric_id IF NOT EXISTS FOR (m:Metric) REQUIRE m.id IS UNIQUE',
    'CREATE CONSTRAINT span_id IF NOT EXISTS FOR (s:Span) REQUIRE s.id IS UNIQUE',
    'CREATE CONSTRAINT topic_id IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE',
    // Search indexes
    'CREATE INDEX file_path IF NOT EXISTS FOR (f:File) ON (f.path)',
    'CREATE INDEX function_name IF NOT EXISTS FOR (f:Function) ON (f.name)',
    'CREATE INDEX function_filepath IF NOT EXISTS FOR (f:Function) ON (f.filePath)',
    'CREATE INDEX class_name IF NOT EXISTS FOR (c:Class) ON (c.name)',
    'CREATE INDEX route_path IF NOT EXISTS FOR (r:Route) ON (r.path)',
    // Index projectId pour l'isolation multi-projet (critique pour la performance)
    'CREATE INDEX file_project IF NOT EXISTS FOR (f:File) ON (f.projectId)',
    'CREATE INDEX function_project IF NOT EXISTS FOR (f:Function) ON (f.projectId)',
    'CREATE INDEX class_project IF NOT EXISTS FOR (c:Class) ON (c.projectId)',
    'CREATE INDEX module_project IF NOT EXISTS FOR (m:Module) ON (m.projectId)',
    'CREATE INDEX route_project IF NOT EXISTS FOR (r:Route) ON (r.projectId)',
    'CREATE INDEX variable_project IF NOT EXISTS FOR (v:Variable) ON (v.projectId)',
    'CREATE INDEX dbtable_project IF NOT EXISTS FOR (d:DBTable) ON (d.projectId)',
    'CREATE INDEX dbcolumn_project IF NOT EXISTS FOR (d:DBColumn) ON (d.projectId)',
    'CREATE INDEX queuejob_project IF NOT EXISTS FOR (q:QueueJob) ON (q.projectId)',
    'CREATE INDEX metric_project IF NOT EXISTS FOR (m:Metric) ON (m.projectId)',
    'CREATE INDEX span_project IF NOT EXISTS FOR (s:Span) ON (s.projectId)',
    'CREATE INDEX topic_project IF NOT EXISTS FOR (t:Topic) ON (t.projectId)',
];

export async function initializeSchema(driver: GraphDriver): Promise<void> {
    for (const stmt of SCHEMA_INIT) {
        try {
        await driver.runWrite(stmt);
        } catch {
            // Ignorer si la contrainte/index existe deja sous un autre nom
        }
    }
}
