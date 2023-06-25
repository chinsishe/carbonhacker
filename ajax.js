// send_request (at the bottom of this file) is probly the most (and only) useful function here.  there's a comment there that describes how to use it.

function get_value(_current, _default)
{
  if (_current == undefined || _current == null)
    return _default;
  
  return _current;
}

var base_url = "http://localhost:5000"; // This can be changed to the base dir for whatever project is using this file; rel_path will be relative to this.

function _request_obj (rel_path, method, params, async, on_load_function, on_err_function)
{
  this.on_load_function = on_load_function;
  this.on_err_function  = on_err_function;
  this._xml_request     = new XMLHttpRequest();
  this.index            = _requests.length;
  var self = this;
  
  base_url = "http://localhost:5000";
  
  method = get_value(method, "GET").toUpperCase();
  async  = get_value(async,  false);
  
  var full_url = base_url + rel_path;
  var body = params;
  if (method == "GET")
  {
    body = "";
    full_url += "?" + params;
  }
  
  this._xml_request.open(method, full_url, async);
  this._xml_request.setRequestHeader("User-Agent", navigator.userAgent);
  
  if (method == "POST")
  {
    this._xml_request.setRequestHeader("Content-type",   "application/x-www-form-urlencoded");
    this._xml_request.setRequestHeader("Content-length", body.length);
  }
  
  if (typeof(this.on_load_function) != "function")
    this.on_load_function = function(feedback) {};
  
  if (typeof(this.on_err_function) != "function")
    this.on_err_function = function(feedback, error_num) { alert('error (' + error_num + '): ' + feedback); };
  
  if (async == true)
  {
    this._xml_request.onreadystatechange = function()
    {
      _requests[self.index] = null;
      if (self._xml_request.readyState == 4)
      {
        if (self._xml_request.status == 200)
          self.on_load_function(self._xml_request.responseText);
        else
          self.on_err_function(self._xml_request.responseText, self._xml_request.status);
      }
    }
  }
  
  this._xml_request.send(body);
}

var _requests = [];

/**
 * sends a request to base_path+rel_path (where base_path is defined above (see my comment), and is empty right now) and either returns the reponse or calls on_load_fn with the response
 * 
 * @param rel_path the path relative to base_path (as defined above)
 * @param method the request method ("GET" by default; can be "POST", "PUT" or "DELETE")
 * @param params query parameters to send with the request
 * @param async if true, this method won't return anything; instead it'll call on_load_fn with the response text as an argument.  if false, this method won't finish until the response has come back, at which point, it'll return the response text.
 * @param on_load_fn the function to call when the response comes back if async is true
 * 
 * @return nothing if async is true; the response text if async is false
 */
function send_request(rel_path, method, params, async, on_load_fn, on_err_fn)
{
  var _request = new _request_obj(rel_path, method, params, async, on_load_fn, on_err_fn);
  _requests[_requests.length] = _request;
  
  
  if (async === undefined || async === null || async === false)
    return _request._xml_request.responseText;
}

var _responses = [];
function _response(div, params, on_load_fn, on_err_fn)
{
  var self = this;
  
  if (on_load_fn === null || on_load_fn === undefined || (typeof on_load_fn) !== "function") // if no on_load function was passed in
    on_load_fn = function(_json) { /* do nothing here */ };
  
  if (on_err_fn === null || on_err_fn === undefined || (typeof on_err_fn) !== "function") // if no on_load function was passed in
    on_err_fn = function(_json) { /* do nothing here */ };
  
  this.div    = div;
  this.params = params;
  this.index  = _responses.length;
  
  this.on_load_fn  = on_load_fn;
  this.on_err_fn   = on_err_fn;
  this.response_fn = function(_json)
  {
    _responses[self.index] = null;
    
    if (_json.length == 0)
    {
      alert("error loading a vew; no data returned.");
      return;
    }
    
    if (_json.substr(0, 1) != "{")
    { // >:-|
      alert("the server returned an invalid view.\n" + _json);
      return;
    }
    
    var json = null;
    eval("json=" + _json);
    
    if (json.view == undefined || json.on_load == undefined)
    {
      self.div.innerHTML = "please <a href='log_in.php'>log back in</a>.  (you're probably seeing this because you left this page idle too long and then clicked a link.  the server here will log you out after a long enough period without any activity, and i haven't made the page refresh when it does that.)";
      return;
    }
    
    self.div.innerHTML = json.view;
    // according to the json standards on json.org, i'm not allowed to use a function as a value in json, so i have to put it in a quoted string and eval it.
    /* that's kinda stupid, though.
    var on_load = null;
    eval("on_load = " + json.on_load);
    on_load();
    /*/
    json.on_load();
    //*/
    
    self.on_load_fn(_json);
  };
  
  _responses[_responses.length] = this;
}


var get_output = (function()
{
  return function(building_type, area, zipcode, electricity_consumption, electricity_eui, gas_consumption, gas_eui)
  {
    var query_params = "building_type=" + building_type +
        // get more parameter values here.
        "&area=" + area +
        "&zipcode=" + zipcode +
        "&electricity_consumption=" + electricity_consumption +
        "&electricity_eui=" + electricity_eui +
        "&gas_consumption=" + gas_consumption +
        "&gas_eui=" + gas_eui;
    
    var result = send_request("/get_output", "GET", query_params, false, undefined, function(response) { alert("error: " + response) });
    
    var result_div = document.getElementById("result");
    result_div.innerHTML = "latest result:<br>" + result.replaceAll(" ", "&nbsp;&nbsp;").replaceAll("\n", "<br />\n");
  };
})();