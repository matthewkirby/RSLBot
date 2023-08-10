import { ButtonInteraction, ButtonStyle } from "discord.js";
import { ButtonData, InteractionButtonData } from "types/ButtonData";

const unlockSpoilerLog: InteractionButtonData = {
  name: 'unlockSpoilerLog',
  label: 'Unlock Spoiler Log',
  style: ButtonStyle.Secondary,
  requiredPermission: 1,
  async execute(interaction: ButtonInteraction) {
    interaction.update({ content: 'Not yet implemented.' })
  }
};

export const buttons: ButtonData[] = [unlockSpoilerLog];