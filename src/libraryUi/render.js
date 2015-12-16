
/**
 * Display a JS notification message to the user
 * @param  {string} message Notification message
 * @param  {string} type    confirm, notice, or error
 * @param  {int} timeout seconds to display notification
 * @return {undefined}
 */
Zotero.ui.jsNotificationMessage = function(message, type, timeout){
    Z.debug("notificationMessage: " + type + " : " + message, 3);
    if(Zotero.config.suppressErrorNotifications) return;
    
    if(!timeout && (timeout !== false)){
        timeout = 5;
    }
    var alertType = "alert-info";
    if(type){
        switch(type){
            case 'error':
            case 'danger':
                alertType = 'alert-danger';
                timeout = false;
                break;
            case 'success':
            case 'confirm':
                alertType = 'alert-success';
                break;
            case 'info':
                alertType = 'alert-info';
                break;
            case 'warning':
            case 'warn':
                alertType = 'alert-warning';
                break;
        }
    }
    
    if(timeout){
        J("#js-message").append("<div class='alert alert-dismissable " + alertType + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>").children("div").delay(parseInt(timeout, 10) * 1000).slideUp().delay(300).queue(function(){
            J(this).remove();
        });
    } else {
        J("#js-message").append("<div class='alert alert-dismissable " + alertType + "'><button type='button' class='close' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>" + message + "</div>");
    }
};

/**
 * Display an error message on ajax failure
 * @param  {jQuery XHR Promise} jqxhr jqxhr returned from jquery.ajax
 * @return {undefined}
 */
Zotero.ui.ajaxErrorMessage = function(jqxhr){
    Z.debug("Zotero.ui.ajaxErrorMessage", 3);
    if(typeof jqxhr == 'undefined'){
        Z.debug('ajaxErrorMessage called with undefined argument');
        return '';
    }
    Z.debug(jqxhr, 3);
    switch(jqxhr.status){
        case 403:
            //don't have permission to view
            if(Zotero.config.loggedIn || Zotero.config.ignoreLoggedInStatus){
                return "You do not have permission to view this library.";
            }
            else{
                Zotero.config.suppressErrorNotifications = true;
                window.location = "/user/login";
                return "";
            }
            break;
        case 404:
            Zotero.ui.jsNotificationMessage("A requested resource could not be found.", 'error');
            break;
        case 400:
            Zotero.ui.jsNotificationMessage("Bad Request", 'error');
            break;
        case 405:
            Zotero.ui.jsNotificationMessage("Method not allowed", 'error');
            break;
        case 412:
            Zotero.ui.jsNotificationMessage("Precondition failed", 'error');
            break;
        case 500:
            Zotero.ui.jsNotificationMessage("Something went wrong but we're not sure what.", 'error');
            break;
        case 501:
            Zotero.ui.jsNotificationMessage("We can't do that yet.", 'error');
            break;
        case 503:
            Zotero.ui.jsNotificationMessage("We've gone away for a little while. Please try again in a few minutes.", 'error');
            break;
        default:
            Z.debug("jqxhr status did not match any expected case");
            Z.debug(jqxhr.status);
            //Zotero.ui.jsNotificationMessage("An error occurred performing the requested action.", 'error');
    }
    return '';
};


/**
 * Empty conatiner and show preloader spinner
 * @param  {Dom Element} el   container
 * @param  {string} type type of preloader to show
 * @return {undefined}
 */
Zotero.ui.showSpinner = function(el, type){
    var spinnerUrl = Zotero.config.baseWebsiteUrl + '/static/images/theme/broken-circle-spinner.gif';
    if(!type){
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    }
    else if(type == 'horizontal'){
        J(el).html("<img class='spinner' src='" + spinnerUrl + "'/>");
    }
};

/**
 * Append a preloader spinner to an element
 * @param  {Dom Element} el container
 * @return {undefined}
 */
Zotero.ui.appendSpinner = function(el){
    var spinnerUrl = Zotero.config.baseWebsiteUrl + 'static/images/theme/broken-circle-spinner.gif';
    J(el).append("<img class='spinner' src='" + spinnerUrl + "'/>");
};

//Take a table that is present in the DOM, save the widths of the headers and the offset of the body,
//set the widths of the columns explicitly, set the header to position:fixed, set the offset of the body explictly
//this has the effect of fixed table headers with scrollable data
Zotero.ui.fixTableHeaders = function(tableEl) {
    var tel = J(tableEl);
    var colWidths = [];
    tel.find("thead th").each(function(ind, th){
        var width = J(th).width();
        colWidths.push(width);
        J(th).width(width);
    });

    tel.find("tbody>tr:first>td").each(function(ind, td){
        J(td).width(colWidths[ind]);
    });

    var bodyOffset = tel.find("thead").height();

    tel.find("thead").css('position', 'fixed').css('margin-top', -bodyOffset).css('background-color', 'white').css('z-index', 10);
    tel.find("tbody").css('margin-top', bodyOffset);
    tel.css("margin-top", bodyOffset);

};
