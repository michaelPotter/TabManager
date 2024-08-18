/*
 * A simple server to store data for the Tab Manager extension.
 */
import express from 'express';
import { mkdirSync } from 'fs';
import { config } from './config';
import ArchiveWindowGroupController from './archiveGroup/archiveGroupController';
import ActiveWindowGroupController from './activeGroup/activeGroupController';

mkdirSync(config().dataDir, { recursive: true });
process.chdir(config().dataDir);

const app = express();
app.use(express.json());


// Set up cors
app.use('*', (req, res, next) => {
    // This is required on GET and OPTIONS requests.
    // TODO: this trusts all plugins I guess. Maybe it should be more restrictive.
    if (req.headers.origin?.match(/moz-extension:\/\//)) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    }
    next();
});
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.send();
});

new ArchiveWindowGroupController().addRoutes(app);
new ActiveWindowGroupController().addRoutes(app);

app.listen(config().port, () => {
    console.log(`Server running on port ${config().port}`);
});
