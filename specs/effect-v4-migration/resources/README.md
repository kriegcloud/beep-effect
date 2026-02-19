This readme contains references to resources that will assist and guide our effort to migrate the beep-effect repository to 
effect v4. 

The beep-effect repository is cloned as a git subtree in .repos/beep-effect

The effect v4 source code exists in .repos/effect-smol. the effect-smol repo contains a MIGRATION.md file which includes
instructions for migrating effect v3 to v4 .repos/effect-smol/MIGRATION.md.

Our migration journey will begin by creating a few packages in `./tooling`. These packages will contain scripts, utilities and modules which will 
assist us in the migration process. The first package we will create is `@beep/repo-utils`. Each of these packages will use effect v4.
Our goal is to both learn effect v4 and create tools which will assist us in the migration process.

