import type * as express from 'express';

import ActiveWindowGroupDAO from './activeGroupDAO';

// Here's the strategy... the plugin is going to break things down as it sends
// them to the server, since it can't send all the data at once. Instead of
// persisting it all separately though, we'll maintain a single object in memory
// that we'll update as we go, and then persist that object to disk as we change it.
//
// That lets the plugin send data in chunks, but keeps this code simple for now.
export default class ActiveWindowGroupController {
	dao = new ActiveWindowGroupDAO();

	addRoutes(app: express.Express): void {
		app.get('/activeGroup', this.listActiveGroups);
		app.post('/activeGroup', this.createOrUpdateActiveGroup);
		app.put('/activeGroup/:name', this.updateActiveGroup);
		app.get('/activeGroup/:name', this.getActiveGroup);
		app.delete('/activeGroup/:name', this.deleteActiveGroup);
	}

	listActiveGroups = async (req: express.Request, res: express.Response) => {
		return res.json(this.dao.listGroups());
	}

	getActiveGroup = async (req: express.Request, res: express.Response) => {
		const name = req.params.name;
		const group = this.dao.getGroup(name);
		if (!group) {
			res.status(404).send('Active group not found');
			return;
		}
		res.json(group);
	}

	createOrUpdateActiveGroup = async (req: express.Request, res: express.Response) => {
		await this.dao.createOrUpdateGroup(req.body);
		res.send({success: true});
	}

	updateActiveGroup = async (req: express.Request, res: express.Response) => {
		await this.dao.updateGroup(req.params.name, req.body);
		return res.send({success: true});
	}

	deleteActiveGroup = async (req: express.Request, res: express.Response) => {
		await this.dao.deleteGroup(req.params.name);
		return res.send({success: true});
	}

}
