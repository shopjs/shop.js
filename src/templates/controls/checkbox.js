function template(locals) {
var jade_debug = [ new jade.DebugItem( 1, "templates/controls/checkbox.jade" ) ];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;

jade_debug.unshift(new jade.DebugItem( 0, "templates/controls/checkbox.jade" ));
jade_debug.unshift(new jade.DebugItem( 1, "templates/controls/checkbox.jade" ));
buf.push("<input id=\"{ input.name }\" name=\"{ name || input.name }\" type=\"checkbox\" onchange=\"{ change }\" onblur=\"{ change }\" __selected=\"{ input.ref(input.name) }\"/>");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 2, "templates/controls/checkbox.jade" ));
buf.push("<yield>");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.shift();
buf.push("</yield>");
jade_debug.shift();
jade_debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "input(id=\"{ input.name }\",name=\"{ name || input.name }\",type=\"checkbox\",onchange=\"{ change }\",onblur=\"{ change }\",__selected=\"{ input.ref(input.name) }\")\n#{ 'yield' }\n");
}
}