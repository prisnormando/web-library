'use strict';

require('babel-regenerator-runtime');

const React = require('react');
const ReactDOM = require('react-dom');

const ItemsContainer = require('./container/items');
const LibraryContainer = require('./container/library');
const LibrariesContainer = require('./container/libraries');

const Button = require('./component/ui/button');
const Libraries = require('./component/libraries');
const Creators = require('./component/form/creators');
const Editable = require('./component/editable');
const EditableContent = require('./component/editable/content');
const Icon = require('./component/ui/icon');
const ItemBox = require('./component/item/box');
const ItemDetails = require('./component/item/details');
const Items = require('./component/item/items');
const Library = require('./component/library');
const Navbar = require('./component/ui/navbar');
const Notes = require('./component/notes');
const Tags = require('./component/tags');
const Attachments = require('./component/attachments');
const Relations = require('./component/relations');
const Panel = require('./component/ui/panel');
const RichEditor = require('./component/rich-editor');
const Spinner = require('./component/ui/spinner');
const TagSelector = require('./component/tag-selector');
const TouchHeader = require('./component/touch-header');
const TouchNavigation = require('./component/touch-navigation');
const { Tab, Tabs } = require('./component/ui/tabs');
const { Toolbar, ToolGroup } = require('./component/ui/toolbars');

//expose components & react
module.exports = {
	React,
	ReactDOM,
	Attachments,
	Button,
	Creators,
	Editable,
	EditableContent,
	Icon,
	ItemBox,
	ItemDetails,
	Items,
	ItemsContainer,
	Libraries,
	LibrariesContainer,
	Library,
	LibraryContainer,
	Navbar,
	Notes,
	Panel,
	Relations,
	RichEditor,
	Spinner,
	Tab,
	Tabs,
	Tags,
	TagSelector,
	Toolbar,
	ToolGroup,
	TouchHeader,
	TouchNavigation,
};
