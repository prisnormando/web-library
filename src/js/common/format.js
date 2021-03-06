'use strict';

const noteAsTitle = note => note.split('\n')[0].replace(/<(?:.|\n)*?>/gm, '');
const creator = creator => 'lastName' in creator ?
	[creator.lastName, creator.firstName].filter(s => s.trim().length).join(', ') : creator.name;
const itemTypeLocalized = (item, itemTypes) => {
	const { itemType } = item;
	if(itemType === 'note') { return "Note" }
	if(itemType === 'attachment') { return "Attachment" }
	return (itemTypes.find(it => it.itemType === itemType) || {}).localized;
}
const dateLocalized = date => (date instanceof Date && !isNaN(date)) ? '' :
	date.toLocaleString(navigator.language || navigator.userLanguage);

//@TODO: figure out better place for this
const itemsSourceLabel = itemsSource => {
	switch(itemsSource) {
		case 'trash':
			return "Trash";
		case 'publications':
			return "My Publications";
		case 'query':
			return "Search results"; //@NOTE: currently not in use
		case 'top':
			return "All Items";
		default:
			return "Items";
	}
}

//@TODO: placeholder, to be replaced with i18n solution
const pluralize = (word, count) => count === 1 ? word : `${word}s`;

module.exports = {
	creator,
	dateLocalized,
	itemsSourceLabel,
	itemTypeLocalized,
	noteAsTitle,
	pluralize,
};
