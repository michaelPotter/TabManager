import type * as express from 'express';

import ArchiveWindowGroupDAO from './archiveGroupDAO';

// Here's the strategy... the plugin is going to break things down as it sends
// them to the server, since it can't send all the data at once. Instead of
// persisting it all separately though, we'll maintain a single object in memory
// that we'll update as we go, and then persist that object to disk as we change it.
//
// That lets the plugin send data in chunks, but keeps this code simple for now.
export default class ArchiveWindowGroupController {
	dao = new ArchiveWindowGroupDAO();

	addRoutes(app: express.Express): void {
		app.get('/archiveGroup', this.listArchiveGroups);
		app.post('/archiveGroup', this.createOrUpdateArchiveGroup);
		app.put('/archiveGroup/:name', this.updateArchiveGroup);
		app.get('/archiveGroup/:name', this.getArchiveGroup);
		app.delete('/archiveGroup/:name', this.deleteArchiveGroup);
	}

	listArchiveGroups = async (req: express.Request, res: express.Response) => {
		return res.json(this.dao.listGroups());
	}

	getArchiveGroup = async (req: express.Request, res: express.Response) => {
		const name = req.params.name;
		const group = this.dao.getGroup(name);
		if (!group) {
			res.status(404).send('Archive group not found');
			return;
		}
		res.json(group);
	}

	createOrUpdateArchiveGroup = async (req: express.Request, res: express.Response) => {
		await this.dao.createOrUpdateGroup(req.body);
		res.send({success: true});
	}

	updateArchiveGroup = async (req: express.Request, res: express.Response) => {
		await this.dao.updateGroup(req.params.name, req.body);
		return res.send({success: true});
	}

	deleteArchiveGroup = async (req: express.Request, res: express.Response) => {
		await this.dao.deleteGroup(req.params.name);
		return res.send({success: true});
	}

}
