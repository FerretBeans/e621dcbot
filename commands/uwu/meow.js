const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

/*
so like this is going to get
a random amount of random e621 posts
but u have to choose the amt
and you can add tags if u want
*/

//the thingy
const uwu = new SlashCommandBuilder()
  	.setName('yiff')
  	.setDescription('you want yiff dont you~')
  	.addIntegerOption(option => option
		.setName('posts')
      	.setDescription('how many images u want ;3')
      	.setRequired(true)
 	 )
 	.addStringOption(option => option
		.setName('tags')
      	.setDescription(`you're such a fucking whore alice~`)
  );

//deals with command
module.exports = {
	data: uwu,

 	async execute(interaction) {
    	const amt = interaction.options.getInteger('posts'); //gets the amount of images wantews
   		const tags = interaction.options.getString('tags') || ''; //gets tags if wanted

    	if (amt < 1 || amt > 320) {
      		return interaction.reply({
        		content: 'max is 320',
        		ephemeral: true
      		});
    	}

    	await interaction.deferReply();

    	try {
      		const query = encodeURIComponent(tags);
      		const { data } = await axios.get(`https://e621.net/posts.json?tags=${query}&limit=${amt}`, {
        		auth: {
          			username: 'fbowo',
          			password: 'HrVmg6CVYRihDBxDpWCs7oJ5'
        		},
        		headers: {
          			'User-Agent': 'yiffbot/1.0 (by fbowo on e621)'
        		}
      		});

      		if (!data.posts || data.posts.length === 0) {
    			return interaction.editReply('tag is probably wrong qwq');
      		}

      		const embeds = data.posts
    			.filter(post => post.file?.url)
        		.slice(0, amt)
        		.map(post => new EmbedBuilder()
        			.setTitle(`Post ID: ${post.id}`)
          			.setURL(`https://e621.net/posts/${post.id}`)
         			.setImage(post.file.url)
         			.setColor(0xff66cc)
        		);

      		if (embeds.length === 0) {
    			return interaction.editReply('no image :c');
      		}

      		await interaction.editReply({ embeds: embeds.slice(0, 10) });

      		const batchSize = 10;
      		for (let i = 10; i < embeds.length; i += batchSize) {
        		const batch = embeds.slice(i, i + batchSize);
       			await interaction.followUp({ embeds: batch });
        		await new Promise(res => setTimeout(res, 50));
      		}

    	} catch (err) {
    		console.error(err);
    		await interaction.editReply('messed up like whats happening with you slut <3');
    	}
	},
};
