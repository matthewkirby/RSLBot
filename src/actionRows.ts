import { ActionRowCollection } from "types/commonTypes";
import { ActionRowBuilder, ButtonBuilder, Collection, StringSelectMenuBuilder } from "discord.js";
import { loadButtonLibrary, getErrorButton, loadSelectMenus } from "./components";

interface actionRowSkeleton {
  [key: string]: string[];
};

const buttonActionRowSkeletons: actionRowSkeleton = {
  messageCreate: ['rollSeasonal', 'viewPresets']
}

// Validates and returns the action rows specified above.
export async function loadActionRows(): Promise<ActionRowCollection> {
  const actionRows: ActionRowCollection = new Collection();
  const componentCollection = await loadButtonLibrary();
  const errorButton = await getErrorButton();

  // For each item in buttonActionRowSkeletons, build the action row.
  for (const name in buttonActionRowSkeletons) {
    const actionRow = new ActionRowBuilder<ButtonBuilder>();

    for (const componentName of buttonActionRowSkeletons[name]) {
      const component = componentCollection.get(componentName);
      if (component === undefined) {
        actionRow.addComponents(errorButton);
        console.log(`No component matching ${componentName} was found while build the ${name} action row.`);
        continue;
      } else if ('button' in component) {
        if (component.button === undefined) {
          actionRow.addComponents(errorButton);
        } else {
          actionRow.addComponents(component.button);
        }
      }
    }

    actionRows.set(name, actionRow);
  }

  // Build the select menu action rows
  const selectMenuLibrary = await loadSelectMenus();
  for (const selectMenu of selectMenuLibrary.values()) {
    if (selectMenu.componentObject !== undefined) {
      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu.componentObject);
      actionRows.set(selectMenu.data.custom_id, actionRow);
    }
  }

  return actionRows;
}