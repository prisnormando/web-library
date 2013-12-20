Zotero.ui.widgets.syncedItems = {};

Zotero.ui.widgets.syncedItems.init = function(el){
    Z.debug("syncedItems widget init", 3);
    
    Zotero.ui.eventful.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {widgetEl: el});
    
    //listen for local items dirty and push if we have a connection
    Zotero.ui.eventful.listen("localItemsChanged", Zotero.ui.widgets.syncedItems.syncItemsCallback, {widgetEl: el});
    //listen for request to update remote items
    Zotero.ui.eventful.listen("remoteItemsRequested", Zotero.ui.widgets.syncedItems.syncItemsCallback, {widgetEl: el});
    Zotero.ui.eventful.listen("syncLibrary", Zotero.ui.widgets.syncedItems.syncItemsCallback, {widgetEl: el});
    //listen for request to display different items
    
    Zotero.ui.eventful.listen("displayedItemsChanged", Zotero.ui.widgets.syncedItems.updateDisplayedItems, {widgetEl: el});
    Zotero.ui.eventful.listen("displayedItemsUpdated", Zotero.ui.widgets.syncedItems.displayItems, {widgetEl: el});
    
    Zotero.ui.eventful.listen("cachedDataLoaded", Zotero.ui.widgets.syncedItems.syncItemsCallback, {widgetEl: el});
    //Zotero.ui.eventful.trigger("remoteItemsRequested");
    
    //set up sorting on header clicks
    var container = J(el);
    //container.on('click', ".field-table-header", Zotero.ui.callbacks.resortItemsLocal);
    Zotero.ui.bindItemLinks();
    
};

Zotero.ui.widgets.syncedItems.syncItemsCallback = function(event){
    Zotero.debug("Zotero eventful syncItemsCallback");
    var widgetEl = event.data.widgetEl;
    var el = widgetEl;
    var jel = J(el);
    
    //get Zotero.Library object if already bound to element
    var library = Zotero.ui.getAssociatedLibrary(el);
    
    //sync items if loaded from cache but not synced
    if(library.items.loaded && (!library.items.synced)){
        Z.debug("items loaded but not synced - loading updated", 3);
        var syncD = library.loadUpdatedItems();
        syncD.then(J.proxy(function(){
            Zotero.nav.doneLoading(el);
            Zotero.ui.eventful.trigger("libraryItemsUpdated");
            Zotero.ui.eventful.trigger("displayedItemsChanged");
        }, this) );
        return;
    }
    else if(library.items.loaded){
        return;
    }
    
    //if no cached or loaded data, load items from the api
    //Should display visible warning to user that this could take a while
    //or we need to figure out how we want to start with just an online widget
    //then change to the synced widget when we're ready. Perhaps synced should
    //only be for apps or special request so just displaying the warning would
    //be acceptable.
    Z.debug("Syncing items for first time, this may take a while.");
    var d = library.loadUpdatedItems();
    d.then(
        J.proxy(function(){
            Zotero.nav.doneLoading(el);
            jel.data('loaded', true);
            Zotero.ui.eventful.trigger("libraryItemsUpdated");
            Zotero.nav.doneLoading(el);
        }, this),
        J.proxy(function(jqxhr, textStatus, errorThrown){
            var elementMessage = Zotero.ui.ajaxErrorMessage(jqxhr);
            jel.html("<p>" + elementMessage + "</p>");
        }, this)
    );
    
    return;
    
};

Zotero.ui.widgets.syncedItems.updateDisplayedItems = function(event){
    Z.debug("widgets.syncedItems.updateDisplayedItems", 3);
    //- determine what config applies that we need to find items for
    //- find the appropriate items in the store, presumably with indexedDB queries
    //- pull out x items that match (or since we have them locally anyway, just display them all)
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    
    var displayParams = Zotero.nav.getUrlVars();
    library.buildItemDisplayView(displayParams); //displayedItemsUpdated triggered from here
};

Zotero.ui.widgets.syncedItems.displayItems = function(event){
    var widgetEl = J(event.data.widgetEl);
    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    var newConfig = Zotero.ui.getItemsConfig(library);
    
    widgetEl.empty();
    Zotero.ui.displayItemsFull(widgetEl, newConfig, {itemsArray:library.items.displayItemsArray, library:library});
};
