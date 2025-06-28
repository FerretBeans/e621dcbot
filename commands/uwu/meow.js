const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// The thingy
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

// Deals with command
module.exports = {
  data: uwu,

  async execute(interaction) {
    const amt = interaction.options.getInteger('posts'); // Gets the amount of images wanted
    let tags = interaction.options.getString('tags') || ''; // Gets tags if wanted

    if (amt < 1 || amt > 320) {
      return interaction.reply({
        content: 'max is 320',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      const query = encodeURIComponent(tags).replace(/%20/g, '+');
      const { data } = await axios.get(`https://e621.net/posts.json?tags=order:random+${query}&limit=${amt}`, {
        auth: {
          username: 'fbowo',
          password: 'HrVmg6CVYRihDBxDpWCs7oJ5'
        },
        headers: {
          'User-Agent': 'yiffbot/1.0 (by fbowo on e621)'
        }
      });

      if (!data.posts || data.posts.length === 0) {
        return interaction.editReply(`tag is probably wrong qwq + ${query}`);
      }

      // Generate embeds for images
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

      const batchSize = 10;
      let startIndex = 0;

      // Send initial embeds
      await interaction.editReply({ embeds: embeds.slice(0, batchSize) });
      setTimeout(() => interaction.deleteReply(), 1200000); // Delete after 20 mins

      // Send subsequent batches
      while (startIndex + batchSize < embeds.length) {
        const batch = embeds.slice(startIndex, startIndex + batchSize);
        const followUp = await interaction.followUp({ embeds: batch });
        setTimeout(() => followUp.delete(), 0);
        startIndex += batchSize;

        // Small delay to prevent rate-limiting
        await new Promise(res => setTimeout(res, 50));
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      await interaction.editReply('messed up like whats happening with you slut <3');
    }
  },
};
