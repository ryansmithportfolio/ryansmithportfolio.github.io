(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{10:function(t){t.exports={CREATE:{title:"Create A Node",inputs:[{name:"name",description:"Description"}]},EDIT:{title:"Edit A Node",inputs:[{title:"Name",name:"name"},{title:"Description",name:"description"}]}}},25:function(t,e,n){t.exports=n(46)},34:function(t,e,n){},35:function(t,e,n){},44:function(t,e,n){},45:function(t,e,n){},46:function(t,e,n){"use strict";n.r(e);var a=n(0),r=n.n(a),i=n(9),o=n.n(i),d=n(5),c=n(6),s=n(1),l={PENDING_CREATE:"PENDING",CREATE:"CREATE",PENDING_EDIT:"PENDING_EDIT",EDIT:"EDIT",MOVE:"MOVE",DELETE:"DELETE",TOGGLE:"TOGGLE"},u={activeNode:null,shouldUpdate:!0,data:{name:"A",description:"Node A",id:1,status:"INCLOMPLETE",children:[{name:"B",description:"Node B",status:"INCLOMPLETE",id:2},{name:"C",description:"Node C",status:"INCLOMPLETE",id:3,children:[{name:"D",description:"Node D",status:"INCLOMPLETE",id:4},{name:"E",description:"Node E",status:"INCLOMPLETE",id:5},{name:"F",description:"Node F",status:"INCLOMPLETE",id:7}]},{name:"G",description:"Node G",status:"INCLOMPLETE",id:6},{name:"H",description:"Node H",status:"INCLOMPLETE",id:10,children:[{name:"I",description:"Node I",status:"INCLOMPLETE",id:9},{name:"J",description:"Node J",status:"INCLOMPLETE",id:11}]},{name:"K",description:"Node K",status:"INCLOMPLETE",id:8}]}},p={modalIsOpen:!1,shouldCloseOnOverlayClick:!0},E=null,h="CREATE",f="EDIT",v={mode:E,formData:{}},m=Object(c.c)({modal:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:p;switch((arguments.length>1?arguments[1]:void 0).type){case"INIT_CREATE_NODE":case"INIT_EDIT_NODE":return Object(s.a)({},t,{modalIsOpen:!0});case"CREATE_NODE":case"EDIT_NODE":case"DELETE_NODE":case"CLOSE_MODAL":return Object(s.a)({},t,{modalIsOpen:!1});default:return t}},tree:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:u,e=arguments.length>1?arguments[1]:void 0;switch(e.type){case"INIT_CREATE_NODE":var n=e.payload.parentId;return Object(s.a)({},t,{shouldUpdate:!1,activeNode:{activeState:l.PENDING,parentId:n}});case"INIT_EDIT_NODE":var a=e.payload,r=a.id,i=a.name,o=a.description,d=a.parentId;return Object(s.a)({},t,{shouldUpdate:!1,activeNode:{id:r,parentId:d,name:i,description:o,activeState:l.PENDING_EDIT}});case"CREATE_NODE":var c=e.payload.id;return Object(s.a)({},t,{shouldUpdate:!0,activeNode:Object(s.a)({},t.activeNode,{activeState:l.CREATE,id:c})});case"EDIT_NODE":var p=e.payload,E=p.name,h=p.description,f=p.status;return Object(s.a)({},t,{shouldUpdate:!0,activeNode:Object(s.a)({},t.activeNode,{activeState:l.EDIT,name:E,description:h,status:f})});case"MOVE_NODE":var v=e.payload.id;return Object(s.a)({},t,{shouldUpdate:!0,activeNode:{id:v,activeState:l.MOVE}});case"DELETE_NODE":return Object(s.a)({},t,{shouldUpdate:!0,activeNode:Object(s.a)({},t.activeNode,{activeState:l.DELETE})});case"TOGGLE_NODE":var m=e.payload.id;return Object(s.a)({},t,{shouldUpdate:!0,activeNode:{id:m,activeState:l.TOGGLE}});default:return t}},form:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:v,e=arguments.length>1?arguments[1]:void 0;switch(e.type){case"INIT_CREATE_NODE":return Object(s.a)({},t,{mode:h});case"INIT_EDIT_NODE":return Object(s.a)({},t,{mode:f});case"EDIT_NODE":var n=e.payload,a=n.id,r=n.name,i=n.description;return Object(s.a)({},t,{mode:f,formData:{id:a,name:r,description:i}});case"CREATE_NODE":case"CLOSE_MODAL":return Object(s.a)({},t,{mode:E});default:return t}}}),N=function(t){return function(e){return function(n){console.log("initial state:",t.getState()),console.log("dispatching:",n),e(n),console.log("next state:",t.getState())}}};function O(t,e){var n;return I(t,function(t){var a=t.data;a?a.id===e&&(n=t):t.id===e&&(n=t)}),n||{}}function y(t){var e=0;return t._children?(I(t,function(t){var n=t.children,a=t._children;n&&n.length&&(e+=n.length),a&&a.length&&(e+=a.length)}),e):e}function I(t,e){e(t);var n=function(t){var e=t.children,n=t._children,a=[];return e&&e.length&&(a=a.concat(e)),n&&n.length&&(a=a.concat(n)),a.length?a:null}(t);n&&n.forEach(function(t){return I(t,e)})}var g=function(t){return function(e){return function(n){var a=t.getState().tree.data;switch(n.type){case"CREATE_NODE":var r=n.payload,i=r.name,o=O(a,r.parentId),d={id:function(t){var e=0;return I(t,function(t){t.id>e&&(e=t.id)}),e}(a)+1,name:i};return o.children&&o.children.length?o.children.push(d):o.children=[d],Object.assign(n.payload,{id:d.id}),e(n);case"EDIT_NODE":var c=n.payload,s=c.id,l=c.name,u=c.description,p=c.status,E=O(a,s);return Object.assign(E,{name:l,description:u,status:p}),e(n);case"DELETE_NODE":var h=n.payload,f=h.id,v=O(a,h.parentId),m=v.children.findIndex(function(t){return t.id===f});return v.children.splice(m,1),e(n);case"TOGGLE_NODE":var N=O(a,n.payload.id),y=N.children,g=N._children;return y&&y.length?(N._children=y,N.children=null):g&&g.length&&(N.children=g,N._children=null),e(n);case"MOVE_NODE":var D=n.payload,T=D.id,C=D.parentId,_=D.newParentId,b=O(a,T),L=O(a,C),k=O(a,_),j=L.children.findIndex(function(t){return t.id===b.id});return L.children.splice(j,1),k.children&&k.children.length?k.children.push(b):k.children=[b],e(n);default:return e(n)}}}},D=function(){try{var t=localStorage.getItem("state");if(null===t)return;return JSON.parse(t)}catch(e){return}}(),T=Object(c.d)(m,D,Object(c.a)(N,g));T.subscribe(function(){return function(t){try{var e=JSON.stringify(t);localStorage.setItem("state",e)}catch(n){}}(T.getState())});var C=T;n(34);function _(){return r.a.createElement("div",{className:"Header"})}n(35);var b,L=n(7),k=n(8),j=n(2),A=function(){function t(e){var n=e.dispatch;Object(L.a)(this,t);this.selectedNode=null,this.draggingNode=null,this.dispatch=n,this.panSpeed=200,this.panBoundary=20,this.i=0,this.duration=750,this.viewerWidth=2*document.body.clientWidth,this.viewerHeight=400,this.tree=j.g().size([this.viewerHeight,this.viewerWidth]),this.baseSvg=j.e("#decision-tree-container").append("svg").attr("width",this.viewerWidth).attr("height",this.viewerHeight).attr("class","overlay"),this.g=j.e("#decision-tree-container svg").append("g").attr("transform","translate(80,0)"),this.dragBehavior=this.dragListener()}return Object(k.a)(t,[{key:"render",value:function(t){var e=t.data;t.activeNode;this.treeData=e,this.root=j.c(this.treeData),this.root.x0=this.viewerHeight/2,this.root.y0=100,this.update(this.root)}},{key:"dragListener",value:function(){var t=this;return{dragStarted:function(e){e!==t.root&&(t.dragStarted=!0,j.e(this).raise().attr("stroke","black"))},dragged:function(e){t.dragStarted&&(t.domNode=this,j.e(this).select(".ghostCircle").attr("pointer-events","none"),j.f(".ghostCircle").attr("class","ghostCircle show"),j.e(this).attr("class","node activeDrag"),t.g.selectAll("path.link").data(t.root.links(),function(t){return t.target.id}).filter(function(t,n){return t.target.id===e.id}).remove(),t.g.selectAll("g.node").data(t.root.descendants(),function(t){return t.id}).filter(function(t,n){return t.id===e.id}).remove())},dragEnded:function(e){if(j.f(".ghostCircle").attr("class","ghostCircle"),!t.selectedNode)return t.update(e);t.moveNode(e,t.selectedNode),j.e(this).attr("stroke",null)}}}},{key:"dispatchActions",value:function(t){this.dispatch(t)}},{key:"initCreateNode",value:function(t){this.dispatchActions({type:"INIT_CREATE_NODE",payload:{parentId:t.data.id}})}},{key:"moveNode",value:function(t,e){this.dispatchActions({type:"MOVE_NODE",payload:{id:t.data.id,parentId:t.parent.data.id,newParentId:e.data.id}})}},{key:"initEditNode",value:function(t){this.dispatchActions({type:"INIT_EDIT_NODE",payload:{id:t.data.id,parentId:t.parent.data.id}})}},{key:"toggle",value:function(t){this.dispatchActions({type:"TOGGLE_NODE",payload:{id:t.data.id}})}},{key:"overCircle",value:function(t){this.selectedNode=t}},{key:"outCircle",value:function(){this.selectedNode=null}},{key:"click",value:function(t){j.b.defaultPrevented||(this.dragStarted=!1,this.toggle(t))}},{key:"dblClick",value:function(t){this.initCreateNode(t)}},{key:"mouseDown",value:function(t){var e=this,n=this;this.mouseIsHeld=!0,setTimeout(function(){e.mouseIsHeld&&n.initEditNode(t)},300)}},{key:"mouseUp",value:function(t){console.log("mouseUp!"),this.mouseIsHeld=!1}},{key:"update",value:function(t){var e=this;this.tree(this.root),this.root.each(function(t){t.y=200*t.depth});var n=this.g.selectAll(".node").data(e.root.descendants(),function(t){return t.id||(t.id=++e.i)}),a=n.enter().append("g").attr("class","node").attr("transform",function(e){return"translate(".concat(t.y0,", ").concat(t.x0,")")}).on("click",e.click.bind(e)).on("dblclick",e.dblClick.bind(e)).call(j.a().on("start",e.dragBehavior.dragStarted).on("drag",e.dragBehavior.dragged).on("end",e.dragBehavior.dragEnded));a.append("circle").attr("r",0).transition().attr("r",function(t){var e=y(t.data);return e?4*e:6}).attr("class","nodeCircle").style("fill",function(t){return"COMPLETE"===t.data.status?"#3CB371":t.data._children?"lightsteelblue":"#fff"}),a.append("text").attr("x",function(t){return t.children||t.data._children?-10:10}).attr("dy",".35em").attr("font-size","150%").attr("class","nodeText").attr("text-anchor",function(t){return t.children||t.data._children?"end":"start"}).text(function(t){return t.data.name}).style("fill-opacity",0),a.append("circle").attr("class","ghostCircle").attr("r",20).attr("opacity",.2).style("fill","red").attr("pointer-events","mouseover").on("mouseover",function(t){e.overCircle(t)}).on("mouseout",function(t){e.outCircle(t)});var r=a.merge(n);r.transition().duration(e.duration).attr("transform",function(t){return"translate(".concat(t.y,",").concat(t.x,")")}),r.select("circle.nodeCircle").attr("r",function(t){var e=y(t.data);return e?4*e:6}).style("fill",function(t){return"COMPLETE"===t.data.status?"#3CB371":t.data._children?"lightsteelblue":"#fff"}),r.select("text").transition().attr("x",function(t){return t.children?-10:t.data._children?-10-2*t.data._children.length:10}).style("fill-opacity",1);var i=n.exit().transition().duration(e.duration).attr("transform","translate(".concat(t.y,", ").concat(t.x,")")).remove();i.select("circle").attr("r",0),i.select("text").style("fill-opacity",0);var o=this.g.selectAll(".link").data(e.root.links(),function(t){return t.target.id});o.enter().insert("path","g").attr("class","link").attr("d",j.d().x(function(e){return t.y0}).y(function(e){return t.x0})).merge(o).transition().duration(e.duration).attr("d",j.d().x(function(t){return t.y}).y(function(t){return t.x})),o.exit().transition().duration(e.duration).attr("d",j.d().x(function(e){return t.y0}).y(function(e){return t.x0})).remove(),n.each(function(t){t.x0=t.x,t.y0=t.y})}}]),t}();var x=Object(d.b)(function(t){var e=t.tree;e&&e.shouldUpdate&&setTimeout(function(){return b.render(e),t},500)},function(t){return setTimeout(function(){(b=new A({dispatch:t})).render({data:{}})},300),{initCreateNode:function(){return t(function(t){return{type:"INIT_CREATE_NODE",payload:{parentId:t}}}.apply(void 0,arguments))},initEditNode:function(){return t(function(t){return{type:"INIT_EDIT_NODE",payload:{id:t}}}.apply(void 0,arguments))},moveNode:function(){return t(function(t,e,n){return{type:"MOVE_NODE",payload:{id:t,parentId:e,newParentId:n}}}.apply(void 0,arguments))},toggleNode:function(){return t(function(t){return{type:"TOGGLE_NODE",payload:{id:t.id}}}.apply(void 0,arguments))}}})(function(){return r.a.createElement("div",{className:"Tree"},r.a.createElement("div",{id:"decision-tree-container"}))}),M=n(13),P=n(12),S=n(14),w=n(19),G=n.n(w),R=n(11),H=n(10),U=function(t){function e(t){var n;return Object(L.a)(this,e),(n=Object(M.a)(this,Object(P.a)(e).call(this,t))).updateInput=function(t,e){n.setState(Object(R.a)({},e,t.target.value))},n.state={name:n.props.formData.name||"Placeholder Name",description:n.props.formData.description||"Placeholder Description"},n}return Object(S.a)(e,t),Object(k.a)(e,[{key:"render",value:function(){var t=this;return r.a.createElement("div",null,r.a.createElement("h2",null,H[this.props.mode]?H[this.props.mode].title:"Hello"),r.a.createElement("form",null,H[this.props.mode]?H[this.props.mode].inputs.map(function(e){return r.a.createElement("div",null,r.a.createElement("h4",null,e.title),r.a.createElement("input",{type:"text",value:t.state[e.name],onChange:function(n){return t.updateInput(n,e.name)}}))}):"Hi",r.a.createElement("div",{onClick:function(){return"EDIT"===t.props.mode?t.props.editNode({id:t.props.formData.id,name:t.state.name,description:t.state.description}):"CREATE"===t.props.mode?t.props.createNode({parentId:t.props.formData.parentId,name:t.state.name}):"Hi"}},"Add / Update Node"),r.a.createElement("div",{onClick:function(){return t.props.editNode({id:t.props.formData.id,status:"COMPLETE",name:t.state.name,description:t.state.description})}},"Mark As Complete"),r.a.createElement("div",{onClick:function(){return t.props.deleteNode({id:t.props.formData.id,parentId:t.props.formData.parentId})}},"Delete")))}}]),e}(r.a.Component),B=Object(d.b)(function(t){var e=t.form.mode,n=t.tree.activeNode;if(e&&n)return{mode:e,formData:{id:n.id,parentId:n.parentId,name:n.name,description:n.description}}},function(t){return{createNode:function(){return t(function(t){return{type:"CREATE_NODE",payload:{name:t.name,parentId:t.parentId}}}.apply(void 0,arguments))},editNode:function(){return t(function(t){return{type:"EDIT_NODE",payload:{id:t.id,name:t.name,description:t.description,status:t.status}}}.apply(void 0,arguments))},deleteNode:function(){return t(function(t){return{type:"DELETE_NODE",payload:{id:t.id,parentId:t.parentId}}}.apply(void 0,arguments))}}})(U);n(44);G.a.setAppElement("#root");var V=function(t){function e(){return Object(L.a)(this,e),Object(M.a)(this,Object(P.a)(e).apply(this,arguments))}return Object(S.a)(e,t),Object(k.a)(e,[{key:"render",value:function(){return r.a.createElement("div",null,r.a.createElement(G.a,{isOpen:this.props.modalIsOpen,shouldCloseOnOverlayClick:this.props.shouldCloseOnOverlayClick,contentLabel:"Nodal"},r.a.createElement(B,null),r.a.createElement("div",{onClick:this.props.closeModal},"Close")))}}]),e}(r.a.Component),J=Object(d.b)(function(t){var e=t.modal,n=e.modalIsOpen,a=e.shouldCloseOnOverlayClick;if(t.tree.activeNode)return{modalIsOpen:n,shouldCloseOnOverlayClick:a}},function(t){return{closeModal:function(){return t({type:"CLOSE_MODAL"})}}})(V);n(45);o.a.render(r.a.createElement(d.a,{store:C},r.a.createElement(function(){return r.a.createElement("div",{className:"App"},r.a.createElement(J,null),r.a.createElement(_,null),r.a.createElement(x,null))},null)),document.getElementById("root"))}},[[25,1,2]]]);
//# sourceMappingURL=main.d298cc77.chunk.js.map