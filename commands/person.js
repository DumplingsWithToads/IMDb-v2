const Command = require('../handlers/commandHandler');

class ActorCommand extends Command {
    constructor(client) {
        super(client, {
            'shortDescription': 'Get information about an actor / actress.',
            'longDescription': 'Get information about a person.',
            'usage': 'Person Name or ID',
            'visible': true,
            'restricted': false,
            'weight': 50
        });
    }

    async process(message) {
        // Check for query
        if (!message.arguments[0]) return this.embed.error(message.channel.id,
            `${this.info.usage} required.`);

        // Status of command response
        const status = await this.embed.create(message.channel.id, {
            'title': 'Searching...' });

        // Get movie from API
        const person = await this.api.getPerson(message.arguments.join(' '));
        if (person.error) return this.embed.error(status, person); // Error

        // Response
        this.embed.edit(status, {
            'url': this.personUrl(person.imdb_id, person.id),
            'title': person.name,
            'description': this.description(person.biography),
            'thumbnail': this.thumbnail(person.profile_path),
            'fields': [{ 'name': 'Known For', 'value': person.known_for_department },
                { 'name': 'Birthday', 'value': this.birthday(person.birthday) },
                { 'name': 'Deathday', 'value': this.deathday(person.deathday) },
                { 'name': 'Gender', 'value': this.gender(person.gender) },
                { 'name': 'Place of Birth', 'value': person.place_of_birth },
                { 'name': 'Popularity', 'value': this.popularity(person.popularity) },
                { 'name': 'IMDb ID', 'value': this.check(person.imdb_id) },
                { 'name': 'TMDb ID', 'value': this.TMDbID(person.id)
            }].map(field => ({ ...field, 'inline': typeof field.inline === 'boolean'
                                                   ? field.inline : true }))
        });
    }
}

module.exports = ActorCommand;