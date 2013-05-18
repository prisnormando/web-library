Zotero.ui.widgets.updatecollectiondialog = {};

Zotero.ui.widgets.updatecollectiondialog.init = function(el){
    Z.debug("updatecollectionsdialog widget init", 3);
    Zotero.ui.eventful.listen("updateCollection", Zotero.ui.widgets.updatecollectiondialog.show, {widgetEl: el});
};

Zotero.ui.widgets.updatecollectiondialog.show = function(e){
    Z.debug("updatecollectiondialog.show", 3);
    
    var triggeringEl = J(e.triggeringElement);
    var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
    var ncollections = library.collections.nestedOrderingArray();
    
    var widgetEl = J(e.data['widgetEl']).empty();
    
    J("#updatecollectiondialogTemplate").tmpl({ncollections:ncollections}).appendTo(widgetEl);
    var dialogEl = widgetEl.find(".update-collection-dialog");
    
    var currentCollectionKey = Zotero.nav.getUrlVar('collectionKey');
    var currentCollection = library.collections.getCollection(currentCollectionKey);
    var currentParentCollectionKey = currentCollection.parentCollectionKey;
    dialogEl.find(".update-collection-parent-select").val(currentParentCollectionKey);
    dialogEl.find(".updated-collection-title-input").val(currentCollection.get("title"));
    
    var saveFunction = J.proxy(function(){
        var newCollectionTitle = dialogEl.find("input.updated-collection-title-input").val() || "Untitled";
        var newParentCollectionKey = dialogEl.find(".update-collection-parent-select").val();
        
        var collection =  currentCollection;
        if(!collection){
            Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
            return false;
        }
        var d = collection.update(newCollectionTitle, newParentCollectionKey);
        d.done(J.proxy(function(){
            Zotero.ui.jsNotificationMessage("Collection Saved", 'confirm');
            library.collections.dirty = true;
            Zotero.nav.pushState(true);
            Zotero.ui.closeDialog(dialogEl);
        }, this));
        Zotero.ui.closeDialog(dialogEl);
    }, this);
    
    dialogEl.find(".updateButton").on('click', saveFunction);
    Zotero.ui.dialog(dialogEl,{});
    dialogEl.find(".updated-collection-title-input").select();
    
    return false;
};
