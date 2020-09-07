import CommandStructure from '../structures/command';

/**
 * Popular command.
 */
class PopularCommand extends CommandStructure {
    /**
     * Create popular command.
     * 
     * @param {Object} client - DMDb client extends Eris
     */
    constructor(client) {
        super(client, {
            description: 'Current popular movies and TV shows on TMDb.',
            usage: false,
            flags: ['page', 'tv'],
            developerOnly: false,
            hideInHelp: false,
            weight: 100
        });
    }

    /**
     * Function to run when command is executed.
     * 
     * @param {Object} message - Message object
     * @param {Array} commandArguments - Command arguments
     * @param {Object} guildSettings - Guild settings
     * @returns {*} A bit of everything...
     */
    async executeCommand(message, commandArguments, guildSettings) {
        // Status "Searching..." message.
        const statusMessage = await this.searchingMessage(message);
        if (!statusMessage) return; // No permission to send messages.

        // Check for flags.
        const flags = this.flags.parse(message.content, this.meta.flags);
        message.content = flags.query; // Remove flags from query.

        // Get options from API.
        const options = this.APIOptions(guildSettings, { page: flags.page || message.content });

        // Get media from API.
        const media = await this.flags.mediaSource(flags);

        // Get results from API.
        const response = await this.client.tmdb[media].getPopular(options);
        if (response.error) return this.embed.error(statusMessage, response.error);

        // Edit status message with response.
        this.embed.edit(statusMessage, {
            title: `Currently Popular ${flags.tv ? 'TV Shows' : 'Movies'}`,
            url: flags.tv ? 'https://www.themoviedb.org/tv' : 'https://www.themoviedb.org/movie',

            thumbnail: { url: this.thumbnailURL(response.results[0].poster_path) },
            description: this.resultsDescription(response),

            fields: response.results.map((result) => flags.tv ? this.fields.renderResult(result.name, [
                // Show
                `First Air Date: ${this.fields.date(result.first_air_date)}`,
                `Vote Average: ${this.fields.check(result.vote_average)}`,
                this.fields.TMDbID(result.id),
            ]) : this.fields.renderResult(result.title, [
                // Movie
                `Release Date: ${this.fields.date(result.release_date)}`,
                `Vote Average: ${this.fields.check(result.vote_average)}`,
                this.fields.TMDbID(result.id),
            ])),
        });
    }
}

export default PopularCommand;
