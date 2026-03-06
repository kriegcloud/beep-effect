import 'dotenv/config';
import { Command } from 'commander';
import { scanCommand } from './commands/scan.js';
import { statusCommand } from './commands/status.js';
import { impactCommand } from './commands/impact.js';
import { initCommand } from './commands/init.js';
import { watchCommand } from './commands/watch.js';
import { serveCommand } from './commands/serve.js';
import { queryCommand } from './commands/query.js';
import { recentCommand } from './commands/recent.js';
import { setupCursorCommand } from './commands/setup-cursor.js';
import { setupWindsurfCommand } from './commands/setup-windsurf.js';
import { projectCommand } from './commands/project.js';
import { prImpactCommand } from './commands/pr-impact.js';
import { explainCommand } from './commands/explain.js';
import { serviceLinksCommand } from './commands/service-links.js';
import { onboardCommand } from './commands/onboard.js';
import { wikiCommand } from './commands/wiki.js';
import { communitiesCommand } from './commands/communities.js';
import { flowsCommand } from './commands/flows.js';
import { diffCommand } from './commands/diff.js';
import { badgeCommand } from './commands/badge.js';
import { setupAntigravityCommand } from './commands/setup-antigravity.js';
import { guardCommand } from './commands/guard.js';
import { renameCommand } from './commands/rename.js';
import { scanIncrementalCommand } from './commands/scan-incremental.js';
import { setupClaudeCommand } from './commands/setup-claude.js';
import { rulesCommand } from './commands/rules.js';
import { testImpactCommand } from './commands/test-impact.js';
import { auditCommand } from './commands/audit.js';
import { migrateCommand } from './commands/migrate.js';
import { dashboardCommand } from './commands/dashboard.js';
import { changelogCommand } from './commands/changelog.js';
import { ciCommand } from './commands/ci.js';
import { doctorCommand } from './commands/doctor.js';

const program = new Command();

program
    .name('nomik')
    .description('Nomik — The Living Blueprint\nhttps://nomik.co — by @willFreed1')
    .version('1.1.1');

program.addCommand(initCommand);
program.addCommand(scanCommand);
program.addCommand(statusCommand);
program.addCommand(impactCommand);
program.addCommand(watchCommand);
program.addCommand(serveCommand);
program.addCommand(queryCommand);
program.addCommand(recentCommand);
program.addCommand(setupCursorCommand);
program.addCommand(setupWindsurfCommand);
program.addCommand(projectCommand);
program.addCommand(prImpactCommand);
program.addCommand(explainCommand);
program.addCommand(serviceLinksCommand);
program.addCommand(onboardCommand);
program.addCommand(wikiCommand);
program.addCommand(communitiesCommand);
program.addCommand(flowsCommand);
program.addCommand(diffCommand);
program.addCommand(badgeCommand);
program.addCommand(setupAntigravityCommand);
program.addCommand(guardCommand);
program.addCommand(renameCommand);
program.addCommand(scanIncrementalCommand);
program.addCommand(setupClaudeCommand);
program.addCommand(rulesCommand);
program.addCommand(testImpactCommand);
program.addCommand(auditCommand);
program.addCommand(migrateCommand);
program.addCommand(dashboardCommand);
program.addCommand(changelogCommand);
program.addCommand(ciCommand);
program.addCommand(doctorCommand);

program.parse();
