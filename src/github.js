import GithubApi from 'github';
import toPairs from 'lodash/toPairs';
import bluebird from 'bluebird';
import { BuildMd } from './helpers';
import fetch from 'node-fetch'

export default class GithubHelper {
	checkValidity() {
		if (!this.token) {
			throw new Error('Missing Github auth token');
		}
		else if (!this.config) {
			throw new Error('Missing Github user and repo');
		}
		else if (!this.config.owner) {
			throw new Error('Missing Github user');
		}
		else if (!this.config.repo) {
			throw new Error('Missing Github repo');
		}
		return true;
	}

	async createBlobs(data, recursive) {
		console.log('in createBlobs')
		try {
			await this.checkValidity();

			let promises;

			if (recursive) {
				promises = await toPairs(data.toWrite).map(pair => [
					pair[0].replace(/_/g, '-'),
					JSON.stringify(pair[1]),
				]);
			} else {
				promises = [
					await JSON.stringify(data.tweets),
					await BuildMd.generateMeta(data.time.yesterdayDate),
				];
			}

			return bluebird.map(promises, async (item, i) => {
				const buffer = await Buffer.from(recursive ? item[1] : item).toString(
					'base64'
				);
				const promiseData = (
					await this.client.gitdata.createBlob({
						...this.config,
						content: buffer,
						encoding: 'base64',
					})
				).data;

				let blobPath;
				if (recursive) {
					blobPath = `data/${item[0]}.json`;
				} else {
					blobPath =
						i === 0
							? `data/${data.time.yesterdayDate}.json`
							: `_posts/${data.time.yesterdayDate}--tweets.md`;
				}

				return Object.assign(promiseData, {
					path: blobPath,
					type: 'blob',
					mode: '100644',
				});
			});
		} catch (e) {
			return Promise.reject(e);
		}
	}

	async getLatestCommitSha(opts = {}) {
		console.log('in getLatestCommitSha')
		console.log('config:', this.config)
		console.log('ref:', 'heads/master')
		try {
			console.log('in getLatestCommitSha before check validity')
			await this.checkValidity();
			console.log('in getLatestCommitSha after check validity')
			// const {data} = await this.client.repos.getShaOfCommitRef({
			// 	...this.config,
			// 	ref: 'heads/master',
			// 	...opts,
			// })
			const data = await fetch(`https://api.github.com/repos/${this.config.owner}/${this.config.repo}/commits/heads/master`, {Authorization: process.env.GITHUB_TOKEN})
			console.log('data', data)
			return data.sha
		} catch (e) {
			console.log('error in getLatestCommitSha')
			return Promise.reject(e);
		}
	}

	async getTree(time, sha, blobs) {
		console.log('in getTree')

		try {
			await this.checkValidity();
			const treeSha = (
				await this.client.gitdata.getTree({
					...this.config,
					sha,
					recursive: true,
				})
			).data.sha;

			return { tree: blobs, base_tree: treeSha };
		} catch (e) {
			return Promise.reject(e);
		}
	}

	async createTree(tree) {
		console.log('in createTree')

		try {
			await this.checkValidity();

			return (
				await this.client.gitdata.createTree({
					...this.config,
					...tree,
				})
			).data.sha;
		} catch (e) {
			return Promise.reject(e);
		}
	}

	async createCommit(treeSha, time, prevCommitSha, message) {
		console.log('in createCommit')

		try {
			await this.checkValidity();

			const parents =
				typeof prevCommitSha === 'object' ? prevCommitSha : [prevCommitSha];
			return (
				await this.client.gitdata.createCommit({
					...this.config,
					message: message || `Add tweets for ${time.yesterdayDate}`,
					tree: treeSha,
					parents,
				})
			).data.sha;
		} catch (e) {
			return Promise.reject(e);
		}
	}

	async updateReference(sha) {
		console.log('in updateReferences')

		try {
			await this.checkValidity();
			return this.client.gitdata.updateReference({
				...this.config,
				ref: 'heads/master',
				sha,
				force: true,
			});
		} catch (e) {
			return Promise.reject(e);
		}
	}

	async run(data, options = {}) {
		console.log('in run')

		try {
			const { recursive, message } = options;

			await this.checkValidity();
			this.client.authenticate({
				type: 'oauth',
				token: this.token,
			});
			const headSha = await this.getLatestCommitSha();

			await this.createBlobs(data, recursive)
				.then(blobs => this.getTree(data.time, headSha, blobs, recursive))
				.then(tree => this.createTree(tree))
				.then(createdTree =>
					this.createCommit(createdTree, data.time, headSha, message)
				)
				.then(commit => this.updateReference(commit));

			return {
				success: true,
			};
		} catch (e) {
			return Promise.reject(e);
		}
	}

	constructor(token, config) {
		if (!token || !config || !config.owner || !config.repo) {
			throw new Error('Missing required props for Github client');
		}

		this.client = new GithubApi({
			debug: false,
			protocol: 'https',
			host: 'api.github.com',
			headers: {
				'user-agent': 'TweetsOfCongressApp',
				'Authorization': process.env.GITHUB_TOKEN,
			},
			timeout: 5000,
			promise: bluebird,
		});

		this.token = token;
		this.config = config;
	}
}
