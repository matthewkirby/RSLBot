import { ButtonInteraction, ButtonStyle } from 'discord.js';
import { ButtonData, InteractionButtonData } from 'types/ButtonData';
import { config } from '../utils/config';
import { presets } from 'types/commonTypes';


const rollSeasonal: InteractionButtonData = {
  name: 'rollSeasonal',
  label: `Roll an S${config.season} RSL Seed (v${config.rslVersion})`,
  style: ButtonStyle.Primary,
  requiredPermission: 1,
  async execute(interaction: ButtonInteraction) {
    rollSeed(interaction);
  }
};

const viewPresets: InteractionButtonData = {
  name: 'viewPresets',
  label: 'View Presets',
  style: ButtonStyle.Secondary,
  requiredPermission: 1,
  async execute(interaction: ButtonInteraction) {
    // rollSeed(interaction, preset);
  }
};
































const rollSeed = (interaction: ButtonInteraction, preset: presets = 'seasonal'): void => {
  console.log(preset);
  console.log(interaction);
}

export const buttons: ButtonData[] = [rollSeasonal, viewPresets];