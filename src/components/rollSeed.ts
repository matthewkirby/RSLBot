import { ButtonInteraction, ButtonStyle, ComponentType, MessageComponentInteraction, StringSelectMenuInteraction } from 'discord.js';
import { ButtonData, InteractionButtonData } from 'types/ButtonData';
import { config } from '../utils/config';
import { SelectMenuData } from 'types/SelectMenuData';
import { FatClient } from 'types/FatClient';

const rollSeasonal: InteractionButtonData = {
  name: 'rollSeasonal',
  label: `Roll an S${config.season} RSL Seed (v${config.rslVersion})`,
  style: ButtonStyle.Primary,
  requiredPermission: 1,
  async execute(interaction: ButtonInteraction) {
    rollSeed(interaction, 'seasonal');
  }
};

const viewPresets: InteractionButtonData = {
  name: 'viewPresets',
  label: 'View Presets',
  style: ButtonStyle.Secondary,
  requiredPermission: 1,
  async execute(interaction: ButtonInteraction) {
    const client = interaction.client as FatClient;
    const presetActionRow = client.actionRows.get('presetSelectionMenu');
    if (presetActionRow === undefined) {
      await interaction.update({ content: 'Error. Command not found.', components: [] });
    } else {
      await interaction.update({ content: '', components: [presetActionRow] });
    }
  }
};

const presetSelectMenu: SelectMenuData = {
  requiredPermission: 1,
  async execute(interaction: StringSelectMenuInteraction) {
    const preset = interaction.values[0];
    rollSeed(interaction, preset);
  },
  data: {
    custom_id: 'presetSelectionMenu',
    placeholder: 'Choose a preset!',
    type: ComponentType.StringSelect,
    options: [
      {
        label: 'Season 6', value: 'seasonal',
        description: 'Base Season 6 RSL weights.'
      },
      {
        label: 'Beginner', value: 'beginner',
        description: 'Beginner friendly RSL weights.'
      },
      {
        label: 'Intermediate', value: 'intermediate',
        description: 'Intermediate RSL weights.'
      },
      {
        label: 'DDR', value: 'ddr',
        description: 'RSL weights with glitch friendly settings.'
      },
      {
        label: 'Bingo', value: 'bingo',
        description: 'RSL Bingo weights.'
      }
    ]
  }
}

const rollSeed = (interaction: MessageComponentInteraction, preset: string): void => {
  interaction.update({ content: `You clicked ${preset}!`, components: [] });
}

export const buttons: ButtonData[] = [rollSeasonal, viewPresets];
export const selectMenus: SelectMenuData[] = [presetSelectMenu];