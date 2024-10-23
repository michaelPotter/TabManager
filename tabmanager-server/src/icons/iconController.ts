import { Icon } from '../types';
import type * as express from 'express';
import { cyrb53 } from '../util';

import IconDAO from './iconDAO';

// Here's the strategy... the plugin is going to break things down as it sends
// them to the server, since it can't send all the data at once. Instead of
// persisting it all separately though, we'll maintain a single object in memory
// that we'll update as we go, and then persist that object to disk as we change it.
//
// That lets the plugin send data in chunks, but keeps this code simple for now.
export default class ArchiveWindowGroupController {
	dao = new IconDAO();

	addRoutes(app: express.Express): void {
		app.post('/icon', this.createOrUpdateIcon);
		app.get('/icon/:hash', this.getIcon);
		app.delete('/icon/:hash', this.deleteIcon);
	}

	getIcon = async (req: express.Request, res: express.Response) => {
		const hash = req.params.hash;
		const icon = this.dao.getIcon(hash);
		if (!icon) {
			res.status(404).send('Icon not found');
			return;
		}
		res.json({hash: icon.name, favIconUrl: icon.favIconUrl});
	}

	createOrUpdateIcon = async (req: express.Request, res: express.Response) => {
		let favIconUrl = req.body.favIconUrl;
		let hash = cyrb53(favIconUrl).toString();
		let icon: Icon = {name: hash, favIconUrl};
		await this.dao.createOrUpdateIcon(icon);
		res.send({hash, favIconUrl});
	}

	deleteIcon = async (req: express.Request, res: express.Response) => {
		await this.dao.deleteIcon(req.params.hash);
		return res.send({success: true});
	}

}
