(function () {
	'use strict';

	function getItem(key) {
	  const data = localStorage.getItem(key);
	  if (!data) return data;
	  return JSON.parse(data);
	}
	function setItem(key, data) {
	  const value = JSON.stringify(data);
	  localStorage.setItem(key, value);
	}

	var VNode = function VNode() {};

	var options = {};
	var stack = [];
	var EMPTY_CHILDREN = [];

	function h(nodeName, attributes) {
	  var children = EMPTY_CHILDREN,
	      lastSimple,
	      child,
	      simple,
	      i;

	  for (i = arguments.length; i-- > 2;) {
	    stack.push(arguments[i]);
	  }

	  if (attributes && attributes.children != null) {
	    if (!stack.length) stack.push(attributes.children);
	    delete attributes.children;
	  }

	  while (stack.length) {
	    if ((child = stack.pop()) && child.pop !== undefined) {
	      for (i = child.length; i--;) {
	        stack.push(child[i]);
	      }
	    } else {
	      if (typeof child === 'boolean') child = null;

	      if (simple = typeof nodeName !== 'function') {
	        if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
	      }

	      if (simple && lastSimple) {
	        children[children.length - 1] += child;
	      } else if (children === EMPTY_CHILDREN) {
	        children = [child];
	      } else {
	        children.push(child);
	      }

	      lastSimple = simple;
	    }
	  }

	  var p = new VNode();
	  p.nodeName = nodeName;
	  p.children = children;
	  p.attributes = attributes == null ? undefined : attributes;
	  p.key = attributes == null ? undefined : attributes.key;
	  return p;
	}

	function extend(obj, props) {
	  for (var i in props) {
	    obj[i] = props[i];
	  }

	  return obj;
	}

	var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

	var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
	var items = [];

	function enqueueRender(component) {
	  if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
	    (defer)(rerender);
	  }
	}

	function rerender() {
	  var p,
	      list = items;
	  items = [];

	  while (p = list.pop()) {
	    if (p._dirty) renderComponent(p);
	  }
	}

	function isSameNodeType(node, vnode, hydrating) {
	  if (typeof vnode === 'string' || typeof vnode === 'number') {
	    return node.splitText !== undefined;
	  }

	  if (typeof vnode.nodeName === 'string') {
	    return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
	  }

	  return hydrating || node._componentConstructor === vnode.nodeName;
	}

	function isNamedNode(node, nodeName) {
	  return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
	}

	function getNodeProps(vnode) {
	  var props = extend({}, vnode.attributes);
	  props.children = vnode.children;
	  var defaultProps = vnode.nodeName.defaultProps;

	  if (defaultProps !== undefined) {
	    for (var i in defaultProps) {
	      if (props[i] === undefined) {
	        props[i] = defaultProps[i];
	      }
	    }
	  }

	  return props;
	}

	function createNode(nodeName, isSvg) {
	  var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
	  node.normalizedNodeName = nodeName;
	  return node;
	}

	function removeNode(node) {
	  var parentNode = node.parentNode;
	  if (parentNode) parentNode.removeChild(node);
	}

	function setAccessor(node, name, old, value, isSvg) {
	  if (name === 'className') name = 'class';

	  if (name === 'key') ; else if (name === 'ref') {
	    if (old) old(null);
	    if (value) value(node);
	  } else if (name === 'class' && !isSvg) {
	    node.className = value || '';
	  } else if (name === 'style') {
	    if (!value || typeof value === 'string' || typeof old === 'string') {
	      node.style.cssText = value || '';
	    }

	    if (value && typeof value === 'object') {
	      if (typeof old !== 'string') {
	        for (var i in old) {
	          if (!(i in value)) node.style[i] = '';
	        }
	      }

	      for (var i in value) {
	        node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
	      }
	    }
	  } else if (name === 'dangerouslySetInnerHTML') {
	    if (value) node.innerHTML = value.__html || '';
	  } else if (name[0] == 'o' && name[1] == 'n') {
	    var useCapture = name !== (name = name.replace(/Capture$/, ''));
	    name = name.toLowerCase().substring(2);

	    if (value) {
	      if (!old) node.addEventListener(name, eventProxy, useCapture);
	    } else {
	      node.removeEventListener(name, eventProxy, useCapture);
	    }

	    (node._listeners || (node._listeners = {}))[name] = value;
	  } else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
	    try {
	      node[name] = value == null ? '' : value;
	    } catch (e) {}

	    if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
	  } else {
	    var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

	    if (value == null || value === false) {
	      if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
	    } else if (typeof value !== 'function') {
	      if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
	    }
	  }
	}

	function eventProxy(e) {
	  return this._listeners[e.type](e);
	}

	var mounts = [];
	var diffLevel = 0;
	var isSvgMode = false;
	var hydrating = false;

	function flushMounts() {
	  var c;

	  while (c = mounts.pop()) {
	    if (c.componentDidMount) c.componentDidMount();
	  }
	}

	function diff(dom, vnode, context, mountAll, parent, componentRoot) {
	  if (!diffLevel++) {
	    isSvgMode = parent != null && parent.ownerSVGElement !== undefined;
	    hydrating = dom != null && !('__preactattr_' in dom);
	  }

	  var ret = idiff(dom, vnode, context, mountAll, componentRoot);
	  if (parent && ret.parentNode !== parent) parent.appendChild(ret);

	  if (! --diffLevel) {
	    hydrating = false;
	    if (!componentRoot) flushMounts();
	  }

	  return ret;
	}

	function idiff(dom, vnode, context, mountAll, componentRoot) {
	  var out = dom,
	      prevSvgMode = isSvgMode;
	  if (vnode == null || typeof vnode === 'boolean') vnode = '';

	  if (typeof vnode === 'string' || typeof vnode === 'number') {
	    if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
	      if (dom.nodeValue != vnode) {
	        dom.nodeValue = vnode;
	      }
	    } else {
	      out = document.createTextNode(vnode);

	      if (dom) {
	        if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
	        recollectNodeTree(dom, true);
	      }
	    }

	    out['__preactattr_'] = true;
	    return out;
	  }

	  var vnodeName = vnode.nodeName;

	  if (typeof vnodeName === 'function') {
	    return buildComponentFromVNode(dom, vnode, context, mountAll);
	  }

	  isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;
	  vnodeName = String(vnodeName);

	  if (!dom || !isNamedNode(dom, vnodeName)) {
	    out = createNode(vnodeName, isSvgMode);

	    if (dom) {
	      while (dom.firstChild) {
	        out.appendChild(dom.firstChild);
	      }

	      if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
	      recollectNodeTree(dom, true);
	    }
	  }

	  var fc = out.firstChild,
	      props = out['__preactattr_'],
	      vchildren = vnode.children;

	  if (props == null) {
	    props = out['__preactattr_'] = {};

	    for (var a = out.attributes, i = a.length; i--;) {
	      props[a[i].name] = a[i].value;
	    }
	  }

	  if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
	    if (fc.nodeValue != vchildren[0]) {
	      fc.nodeValue = vchildren[0];
	    }
	  } else if (vchildren && vchildren.length || fc != null) {
	    innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
	  }

	  diffAttributes(out, vnode.attributes, props);
	  isSvgMode = prevSvgMode;
	  return out;
	}

	function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
	  var originalChildren = dom.childNodes,
	      children = [],
	      keyed = {},
	      keyedLen = 0,
	      min = 0,
	      len = originalChildren.length,
	      childrenLen = 0,
	      vlen = vchildren ? vchildren.length : 0,
	      j,
	      c,
	      f,
	      vchild,
	      child;

	  if (len !== 0) {
	    for (var i = 0; i < len; i++) {
	      var _child = originalChildren[i],
	          props = _child['__preactattr_'],
	          key = vlen && props ? _child._component ? _child._component.__key : props.key : null;

	      if (key != null) {
	        keyedLen++;
	        keyed[key] = _child;
	      } else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
	        children[childrenLen++] = _child;
	      }
	    }
	  }

	  if (vlen !== 0) {
	    for (var i = 0; i < vlen; i++) {
	      vchild = vchildren[i];
	      child = null;
	      var key = vchild.key;

	      if (key != null) {
	        if (keyedLen && keyed[key] !== undefined) {
	          child = keyed[key];
	          keyed[key] = undefined;
	          keyedLen--;
	        }
	      } else if (min < childrenLen) {
	        for (j = min; j < childrenLen; j++) {
	          if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
	            child = c;
	            children[j] = undefined;
	            if (j === childrenLen - 1) childrenLen--;
	            if (j === min) min++;
	            break;
	          }
	        }
	      }

	      child = idiff(child, vchild, context, mountAll);
	      f = originalChildren[i];

	      if (child && child !== dom && child !== f) {
	        if (f == null) {
	          dom.appendChild(child);
	        } else if (child === f.nextSibling) {
	          removeNode(f);
	        } else {
	          dom.insertBefore(child, f);
	        }
	      }
	    }
	  }

	  if (keyedLen) {
	    for (var i in keyed) {
	      if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
	    }
	  }

	  while (min <= childrenLen) {
	    if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
	  }
	}

	function recollectNodeTree(node, unmountOnly) {
	  var component = node._component;

	  if (component) {
	    unmountComponent(component);
	  } else {
	    if (node['__preactattr_'] != null && node['__preactattr_'].ref) node['__preactattr_'].ref(null);

	    if (unmountOnly === false || node['__preactattr_'] == null) {
	      removeNode(node);
	    }

	    removeChildren(node);
	  }
	}

	function removeChildren(node) {
	  node = node.lastChild;

	  while (node) {
	    var next = node.previousSibling;
	    recollectNodeTree(node, true);
	    node = next;
	  }
	}

	function diffAttributes(dom, attrs, old) {
	  var name;

	  for (name in old) {
	    if (!(attrs && attrs[name] != null) && old[name] != null) {
	      setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
	    }
	  }

	  for (name in attrs) {
	    if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
	      setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
	    }
	  }
	}

	var recyclerComponents = [];

	function createComponent(Ctor, props, context) {
	  var inst,
	      i = recyclerComponents.length;

	  if (Ctor.prototype && Ctor.prototype.render) {
	    inst = new Ctor(props, context);
	    Component.call(inst, props, context);
	  } else {
	    inst = new Component(props, context);
	    inst.constructor = Ctor;
	    inst.render = doRender;
	  }

	  while (i--) {
	    if (recyclerComponents[i].constructor === Ctor) {
	      inst.nextBase = recyclerComponents[i].nextBase;
	      recyclerComponents.splice(i, 1);
	      return inst;
	    }
	  }

	  return inst;
	}

	function doRender(props, state, context) {
	  return this.constructor(props, context);
	}

	function setComponentProps(component, props, renderMode, context, mountAll) {
	  if (component._disable) return;
	  component._disable = true;
	  component.__ref = props.ref;
	  component.__key = props.key;
	  delete props.ref;
	  delete props.key;

	  if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
	    if (!component.base || mountAll) {
	      if (component.componentWillMount) component.componentWillMount();
	    } else if (component.componentWillReceiveProps) {
	      component.componentWillReceiveProps(props, context);
	    }
	  }

	  if (context && context !== component.context) {
	    if (!component.prevContext) component.prevContext = component.context;
	    component.context = context;
	  }

	  if (!component.prevProps) component.prevProps = component.props;
	  component.props = props;
	  component._disable = false;

	  if (renderMode !== 0) {
	    if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
	      renderComponent(component, 1, mountAll);
	    } else {
	      enqueueRender(component);
	    }
	  }

	  if (component.__ref) component.__ref(component);
	}

	function renderComponent(component, renderMode, mountAll, isChild) {
	  if (component._disable) return;
	  var props = component.props,
	      state = component.state,
	      context = component.context,
	      previousProps = component.prevProps || props,
	      previousState = component.prevState || state,
	      previousContext = component.prevContext || context,
	      isUpdate = component.base,
	      nextBase = component.nextBase,
	      initialBase = isUpdate || nextBase,
	      initialChildComponent = component._component,
	      skip = false,
	      snapshot = previousContext,
	      rendered,
	      inst,
	      cbase;

	  if (component.constructor.getDerivedStateFromProps) {
	    state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
	    component.state = state;
	  }

	  if (isUpdate) {
	    component.props = previousProps;
	    component.state = previousState;
	    component.context = previousContext;

	    if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
	      skip = true;
	    } else if (component.componentWillUpdate) {
	      component.componentWillUpdate(props, state, context);
	    }

	    component.props = props;
	    component.state = state;
	    component.context = context;
	  }

	  component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
	  component._dirty = false;

	  if (!skip) {
	    rendered = component.render(props, state, context);

	    if (component.getChildContext) {
	      context = extend(extend({}, context), component.getChildContext());
	    }

	    if (isUpdate && component.getSnapshotBeforeUpdate) {
	      snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
	    }

	    var childComponent = rendered && rendered.nodeName,
	        toUnmount,
	        base;

	    if (typeof childComponent === 'function') {
	      var childProps = getNodeProps(rendered);
	      inst = initialChildComponent;

	      if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
	        setComponentProps(inst, childProps, 1, context, false);
	      } else {
	        toUnmount = inst;
	        component._component = inst = createComponent(childComponent, childProps, context);
	        inst.nextBase = inst.nextBase || nextBase;
	        inst._parentComponent = component;
	        setComponentProps(inst, childProps, 0, context, false);
	        renderComponent(inst, 1, mountAll, true);
	      }

	      base = inst.base;
	    } else {
	      cbase = initialBase;
	      toUnmount = initialChildComponent;

	      if (toUnmount) {
	        cbase = component._component = null;
	      }

	      if (initialBase || renderMode === 1) {
	        if (cbase) cbase._component = null;
	        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
	      }
	    }

	    if (initialBase && base !== initialBase && inst !== initialChildComponent) {
	      var baseParent = initialBase.parentNode;

	      if (baseParent && base !== baseParent) {
	        baseParent.replaceChild(base, initialBase);

	        if (!toUnmount) {
	          initialBase._component = null;
	          recollectNodeTree(initialBase, false);
	        }
	      }
	    }

	    if (toUnmount) {
	      unmountComponent(toUnmount);
	    }

	    component.base = base;

	    if (base && !isChild) {
	      var componentRef = component,
	          t = component;

	      while (t = t._parentComponent) {
	        (componentRef = t).base = base;
	      }

	      base._component = componentRef;
	      base._componentConstructor = componentRef.constructor;
	    }
	  }

	  if (!isUpdate || mountAll) {
	    mounts.unshift(component);
	  } else if (!skip) {
	    if (component.componentDidUpdate) {
	      component.componentDidUpdate(previousProps, previousState, snapshot);
	    }
	  }

	  while (component._renderCallbacks.length) {
	    component._renderCallbacks.pop().call(component);
	  }

	  if (!diffLevel && !isChild) flushMounts();
	}

	function buildComponentFromVNode(dom, vnode, context, mountAll) {
	  var c = dom && dom._component,
	      originalComponent = c,
	      oldDom = dom,
	      isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
	      isOwner = isDirectOwner,
	      props = getNodeProps(vnode);

	  while (c && !isOwner && (c = c._parentComponent)) {
	    isOwner = c.constructor === vnode.nodeName;
	  }

	  if (c && isOwner && (!mountAll || c._component)) {
	    setComponentProps(c, props, 3, context, mountAll);
	    dom = c.base;
	  } else {
	    if (originalComponent && !isDirectOwner) {
	      unmountComponent(originalComponent);
	      dom = oldDom = null;
	    }

	    c = createComponent(vnode.nodeName, props, context);

	    if (dom && !c.nextBase) {
	      c.nextBase = dom;
	      oldDom = null;
	    }

	    setComponentProps(c, props, 1, context, mountAll);
	    dom = c.base;

	    if (oldDom && dom !== oldDom) {
	      oldDom._component = null;
	      recollectNodeTree(oldDom, false);
	    }
	  }

	  return dom;
	}

	function unmountComponent(component) {
	  var base = component.base;
	  component._disable = true;
	  if (component.componentWillUnmount) component.componentWillUnmount();
	  component.base = null;
	  var inner = component._component;

	  if (inner) {
	    unmountComponent(inner);
	  } else if (base) {
	    if (base['__preactattr_'] && base['__preactattr_'].ref) base['__preactattr_'].ref(null);
	    component.nextBase = base;
	    removeNode(base);
	    recyclerComponents.push(component);
	    removeChildren(base);
	  }

	  if (component.__ref) component.__ref(null);
	}

	function Component(props, context) {
	  this._dirty = true;
	  this.context = context;
	  this.props = props;
	  this.state = this.state || {};
	  this._renderCallbacks = [];
	}

	extend(Component.prototype, {
	  setState: function setState(state, callback) {
	    if (!this.prevState) this.prevState = this.state;
	    this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
	    if (callback) this._renderCallbacks.push(callback);
	    enqueueRender(this);
	  },
	  forceUpdate: function forceUpdate(callback) {
	    if (callback) this._renderCallbacks.push(callback);
	    renderComponent(this, 2);
	  },
	  render: function render() {}
	});

	function render(vnode, parent, merge) {
	  return diff(merge, vnode, {}, false, parent, false);
	}

	var movies = [{
	  id: 1,
	  title: 'The Untouchables',
	  year: 1987,
	  duration: 119,
	  genres: ['Crime', 'Drama', 'History'],
	  rating: 8,
	  description: '\nFederal Agent Eliot Ness sets out to stop Al Capone; because of rampant corruption, he assembles a small, hand-picked team.    ',
	  url: 'http://www.imdb.com/title/tt0094226/',
	  cover: '/images/MV5BMTc1MzY0MTcyMV5BMl5BanBnXkFtZTcwMzE3Njk3OA@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTc1MzY0MTcyMV5BMl5BanBnXkFtZTcwMzE3Njk3OA@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 2,
	  title: 'JFK',
	  year: 1991,
	  duration: 205,
	  genres: ['Drama', 'History', 'Thriller'],
	  rating: 8,
	  description: '\nA New Orleans DA discovers there\'s more to the Kennedy assassination than the official story.    ',
	  url: 'http://www.imdb.com/title/tt0102138/',
	  cover: '/images/MV5BMTY4ODI3Njg5N15BMl5BanBnXkFtZTgwODgyMDUxMDE@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTY4ODI3Njg5N15BMl5BanBnXkFtZTgwODgyMDUxMDE@._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\JFK.DirCut.1991.1080p.BluRay.DTS.x264-ESiR\\JFK.DirCut.1991.1080p.BluRay.DTS.x264-ESiR.mkv'
	}, {
	  id: 3,
	  title: 'Robin Hood: Prince of Thieves',
	  year: 1991,
	  duration: 155,
	  genres: ['Action', 'Adventure', 'Drama'],
	  rating: 6.9,
	  description: '\nWhen Robin and his Moorish companion come to England and the tyranny of the Sheriff of Nottingham, he decides to fight back as an outlaw.    ',
	  url: 'http://www.imdb.com/title/tt0102798/',
	  cover: '/images/MV5BMTU2NzkyNzkzOF5BMl5BanBnXkFtZTcwNDk4NTgyMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTU2NzkyNzkzOF5BMl5BanBnXkFtZTcwNDk4NTgyMQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 4,
	  title: 'The Bodyguard',
	  year: 1992,
	  duration: 129,
	  genres: ['Drama', 'Music', 'Romance'],
	  rating: 6,
	  description: '\nA former Secret Service agent takes on the job of bodyguard to a pop singer, whose lifestyle is most unlike a President\'s.    ',
	  url: 'http://www.imdb.com/title/tt0103855/',
	  cover: '/images/MV5BMTYxMTc4NDc2N15BMl5BanBnXkFtZTYwNTYxMzA5._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTYxMTc4NDc2N15BMl5BanBnXkFtZTYwNTYxMzA5._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 5,
	  title: 'Tin Cup',
	  year: 1996,
	  duration: 135,
	  genres: ['Comedy', 'Drama', 'Romance'],
	  rating: 6.3,
	  description: '\nA washed up golf pro working at a driving range tries to qualify for the US Open in order to win the heart of his succesful rival\'s girlfriend.    ',
	  url: 'http://www.imdb.com/title/tt0117918/',
	  cover: '/images/MV5BMTQ4Mjk4OTg0NV5BMl5BanBnXkFtZTcwOTIwMDcyMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTQ4Mjk4OTg0NV5BMl5BanBnXkFtZTcwOTIwMDcyMQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 6,
	  title: 'A Perfect World',
	  year: 1993,
	  duration: 138,
	  genres: ['Crime', 'Drama', 'Thriller'],
	  rating: 7.5,
	  description: '\nA kidnapped boy strikes up a friendship with his captor: an escaped convict on the run from the law, headed by an honorable U.S. Marshal.    ',
	  url: 'http://www.imdb.com/title/tt0107808/',
	  cover: '/images/MV5BMjAxMDExODExOV5BMl5BanBnXkFtZTcwMTI3MTcxMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMjAxMDExODExOV5BMl5BanBnXkFtZTcwMTI3MTcxMQ@@._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\A.Perfect.World.1993.720p.BluRay.X264-BLOW\\a.perfect.world.1993.720p.bluray.x264-blow.rar'
	}, {
	  id: 7,
	  title: 'Waterworld',
	  year: 1995,
	  duration: 135,
	  genres: ['Action', 'Adventure', 'Sci-Fi'],
	  rating: 6,
	  description: '\nIn a future where the polar ice caps have melted and most of Earth is underwater, a mutated mariner fights starvation and outlaw \'smokers,\' and reluctantly helps a woman and a young girl try to find dry land.    ',
	  url: 'http://www.imdb.com/title/tt0114898/',
	  cover: '/images/MV5BMTA2Nzk3MTgzMTVeQTJeQWpwZ15BbWU3MDgyNTgxNjk@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTA2Nzk3MTgzMTVeQTJeQWpwZ15BbWU3MDgyNTgxNjk@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 8,
	  title: 'The Postman',
	  year: 1997,
	  duration: 177,
	  genres: ['Action', 'Adventure', 'Drama'],
	  rating: 5.9,
	  description: '\nA drifter with no name finds a Jeep with the skeleton of a postman and a bag of mail and dons the postman\'s uniform and bag of mail as he begins a quest to inspire hope to the survivors living in the post apocalyptic America.    ',
	  url: 'http://www.imdb.com/title/tt0119925/',
	  cover: '/images/MV5BMTAzNzg0OTE5NjheQTJeQWpwZ15BbWU3MDc1MDEwMjE@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTAzNzg0OTE5NjheQTJeQWpwZ15BbWU3MDc1MDEwMjE@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 9,
	  title: '3000 Miles to Graceland',
	  year: 2001,
	  duration: 125,
	  genres: ['Action', 'Comedy', 'Crime'],
	  rating: 5.9,
	  description: '\nA gang of ex-cons rob a casino during Elvis convention week.    ',
	  url: 'http://www.imdb.com/title/tt0233142/',
	  cover: '/images/MV5BMTExMDA0NDAyOTReQTJeQWpwZ15BbWU2MDM4ODg3OQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTExMDA0NDAyOTReQTJeQWpwZ15BbWU2MDM4ODg3OQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 10,
	  title: 'The Guardian',
	  year: 2006,
	  duration: 139,
	  genres: ['Action', 'Adventure', 'Drama'],
	  rating: 6.8,
	  description: '\nA high school swim champion with a troubled past enrolls in the U.S. Coast Guard\'s \'A\' School, where legendary rescue swimmer Ben Randall teaches him some hard lessons about loss, love, and self-sacrifice.    ',
	  url: 'http://www.imdb.com/title/tt0406816/',
	  cover: '/images/MV5BMTI0MDkzMzQ1M15BMl5BanBnXkFtZTcwMDQ3MTQzMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTI0MDkzMzQ1M15BMl5BanBnXkFtZTcwMDQ3MTQzMQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 11,
	  title: 'Swing Vote',
	  year: 2008,
	  duration: 120,
	  genres: ['Comedy', 'Drama'],
	  rating: 6.1,
	  description: '\nIn a remarkable turn-of-events, the result of the presidential election comes down to one man\'s vote.    ',
	  url: 'http://www.imdb.com/title/tt1027862/',
	  cover: '/images/MV5BMjAwMTQyNzkwNV5BMl5BanBnXkFtZTcwNTgyMzE3MQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMjAwMTQyNzkwNV5BMl5BanBnXkFtZTcwNTgyMzE3MQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 12,
	  title: 'For Love of the Game',
	  year: 1999,
	  duration: 137,
	  genres: ['Drama', 'Romance', 'Sport'],
	  rating: 6.5,
	  description: '\nA washed up pitcher flashes through his career.    ',
	  url: 'http://www.imdb.com/title/tt0126916/',
	  cover: '/images/MV5BMTcyMDk1ODM5N15BMl5BanBnXkFtZTYwNjYzNzQ5._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTcyMDk1ODM5N15BMl5BanBnXkFtZTYwNjYzNzQ5._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\For.Love.Of.The.Game.1999.DVDRip.XviD-SHK'
	}, {
	  id: 13,
	  title: 'Fandango',
	  year: 1985,
	  duration: 91,
	  genres: ['Comedy'],
	  rating: 6,
	  description: '\nFive college buddies from the University of Texas circa 1971 embark on a final road trip odyssey across the Mexican border before facing up to uncertain futures, in Vietnam and otherwise.',
	  url: 'http://www.imdb.com/title/tt0089126/',
	  cover: '/images/MV5BMTUwNTA1MzUxOV5BMl5BanBnXkFtZTcwNDY0NDcyMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTUwNTA1MzUxOV5BMl5BanBnXkFtZTcwNDY0NDcyMQ@@._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Fandango.1985.DVDRip.XviD-SHK\\fandango-shk.avi'
	}, {
	  id: 14,
	  title: 'Field of Dreams',
	  year: 1989,
	  duration: 107,
	  genres: ['Drama', 'Family', 'Fantasy'],
	  rating: 7,
	  description: '\nAn Iowa corn farmer, hearing voices, interprets them as a command to build a baseball diamond in his fields; he does, and the Chicago Black Sox come.',
	  url: 'http://www.imdb.com/title/tt0097351/',
	  cover: '/images/MV5BMTkxNDc3MzMwOF5BMl5BanBnXkFtZTcwMzY1Mjk3OA@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTkxNDc3MzMwOF5BMl5BanBnXkFtZTcwMzY1Mjk3OA@@._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Field.Of.Dreams.1989.720p.BRRiP.XViD.AC3-FLAWL3SS\\Field.Of.Dreams.1989.720p.BRRiP.XViD.AC3-FLAWL3SS.avi'
	}, {
	  id: 15,
	  title: 'Message in a Bottle',
	  year: 1999,
	  duration: 131,
	  genres: ['Drama', 'Romance'],
	  rating: 6,
	  description: '\nA woman discovers a tragic love letter in a bottle on a beach, and is determined to track down its author.',
	  url: 'http://www.imdb.com/title/tt0139462/',
	  cover: '/images/MV5BMTQyMDMxMDkwNV5BMl5BanBnXkFtZTcwMDQ0NzcyMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTQyMDMxMDkwNV5BMl5BanBnXkFtZTcwMDQ0NzcyMQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 16,
	  title: 'Mr. Brooks',
	  year: 2007,
	  duration: 120,
	  genres: ['Crime', 'Drama', 'Mystery'],
	  rating: 7,
	  description: '\nA psychological thriller about a man who is sometimes controlled by his murder-and-mayhem-loving alter ego.',
	  url: 'http://www.imdb.com/title/tt0780571/',
	  cover: '/images/MV5BMTQyNTk5MTMxN15BMl5BanBnXkFtZTcwNTc0ODI1NA@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTQyNTk5MTMxN15BMl5BanBnXkFtZTcwNTc0ODI1NA@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 17,
	  title: 'No Way Out',
	  year: 1987,
	  duration: 114,
	  genres: ['Action', 'Crime', 'Drama'],
	  rating: 7,
	  description: '\nA coverup and witchhunt occur after a politician accidentally kills his mistress.',
	  url: 'http://www.imdb.com/title/tt0093640/',
	  cover: '/images/MV5BMTQ2OTkxNzIzN15BMl5BanBnXkFtZTcwNTgwOTc2NA@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTQ2OTkxNzIzN15BMl5BanBnXkFtZTcwNTgwOTc2NA@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 18,
	  title: 'Rumor Has It...',
	  year: 2005,
	  duration: 97,
	  genres: ['Comedy', 'Drama', 'Romance'],
	  rating: 5,
	  description: '\nSarah Huttinger is a woman who learns that her family was the inspiration for the book and film \'The Graduate\' -- and that she just might be the offspring of the well-documented event.',
	  url: 'http://www.imdb.com/title/tt0398375/',
	  cover: '/images/MV5BOTg3Njk2NTIxNF5BMl5BanBnXkFtZTcwNTc4MTEzMw@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BOTg3Njk2NTIxNF5BMl5BanBnXkFtZTcwNTc4MTEzMw@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 19,
	  title: 'Thirteen Days',
	  year: 2000,
	  duration: 145,
	  genres: ['Drama', 'History', 'Thriller'],
	  rating: 7,
	  description: '\nA dramatization of President Kennedy\'s administration\'s struggle to contain the Cuban Missile Crisis in October of 1962.',
	  url: 'http://www.imdb.com/title/tt0146309/',
	  cover: '/images/MV5BMTkwMTkxNTYyM15BMl5BanBnXkFtZTYwOTc5NTk2._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTkwMTkxNTYyM15BMl5BanBnXkFtZTYwOTc5NTk2._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 20,
	  title: 'Wyatt Earp',
	  year: 1994,
	  duration: 191,
	  genres: ['Action', 'Adventure', 'Biography'],
	  rating: 6,
	  description: '\nWyatt Earp is a movie about a man and his family. The movie shows us the good times and the bad times of one of the West\'s most famous individuals.',
	  url: 'http://www.imdb.com/title/tt0111756/',
	  cover: '/images/MV5BMTIxOTAzNDkyNF5BMl5BanBnXkFtZTcwMzA3NDE2MQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTIxOTAzNDkyNF5BMl5BanBnXkFtZTcwMzA3NDE2MQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 21,
	  title: 'American Flyers',
	  year: 1985,
	  duration: 113,
	  genres: ['Drama', 'Sport'],
	  rating: 6,
	  description: '\nSports physician Marcus persuades his unstable brother David to come with him and train for a bicycle race across the Rocky Mountains. He doesn\'t tell him that he has a brain aneurysm which...\n',
	  url: 'http://www.imdb.com/title/tt0088707/',
	  cover: '/images/MV5BMTU4MDU2OTk0MF5BMl5BanBnXkFtZTcwODQ0NzgxMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTU4MDU2OTk0MF5BMl5BanBnXkFtZTcwODQ0NzgxMQ@@._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\American.Flyers.1985.DVDRip.XviD-SHK'
	}, {
	  id: 22,
	  title: 'Dragonfly',
	  year: 2002,
	  duration: 104,
	  genres: ['Drama', 'Fantasy', 'Mystery'],
	  rating: 6,
	  description: '\nA grieving doctor is being contacted by his late wife through his patients near death experiences.',
	  url: 'http://www.imdb.com/title/tt0259288/',
	  cover: '/images/MV5BMTQ0OTIxODg3NV5BMl5BanBnXkFtZTcwMzAwMDcxMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTQ0OTIxODg3NV5BMl5BanBnXkFtZTcwMzAwMDcxMQ@@._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Dragonfly.DVDRip.DivX-ViTE\\vite-divx-df.rar'
	}, {
	  id: 23,
	  title: 'Open Range',
	  year: 2003,
	  duration: 139,
	  genres: ['Action', 'Romance', 'Western'],
	  rating: 7,
	  description: '\nA former gunslinger is forced to take up arms again when he and his cattle crew are threatened by a corrupt lawman.',
	  url: 'http://www.imdb.com/title/tt0316356/',
	  cover: '/images/MV5BMTYyNjA4NTY3N15BMl5BanBnXkFtZTYwNjc0MDM3._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTYyNjA4NTY3N15BMl5BanBnXkFtZTYwNjc0MDM3._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 24,
	  title: 'Revenge',
	  year: 1990,
	  duration: 124,
	  genres: ['Crime', 'Drama', 'Romance'],
	  rating: 6,
	  description: '\nMichael \'Jay\' Cochran has just left the Navy after 12 years. He\'s not quite sure what he\'s going to do, except that he knows he wants a holiday. He decides to visit Tiburon Mendez, a ...\n',
	  url: 'http://www.imdb.com/title/tt0100485/',
	  cover: '/images/MV5BMjExNzQ1Nzc2N15BMl5BanBnXkFtZTcwNzE3MTc0MQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMjExNzQ1Nzc2N15BMl5BanBnXkFtZTcwNzE3MTc0MQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 25,
	  title: 'Silverado',
	  year: 1985,
	  duration: 133,
	  genres: ['Action', 'Crime', 'Drama'],
	  rating: 7,
	  description: '\nA misfit bunch of friends come together to right the injustices which exist in a small town.',
	  url: 'http://www.imdb.com/title/tt0090022/',
	  cover: '/images/MV5BMTQ0MTMwMjY0MV5BMl5BanBnXkFtZTcwODMwMjgyMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTQ0MTMwMjY0MV5BMl5BanBnXkFtZTcwODMwMjgyMQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 26,
	  title: 'The Gunrunner',
	  year: 1989,
	  duration: 92,
	  genres: ['Crime', 'Drama'],
	  rating: 3,
	  description: '\n1926. The Chinese Civil War. Drifter Ted Beaubien is captured and forced to witness his girlfriend\'s execution. He finally escapes and vows to avenge her death by taking on a deadly mission...\n',
	  url: 'http://www.imdb.com/title/tt0087374/',
	  cover: '/images/MV5BMTU4MDAwMzQyOV5BMl5BanBnXkFtZTcwNzExMzgzMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTU4MDAwMzQyOV5BMl5BanBnXkFtZTcwNzExMzgzMQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 27,
	  title: 'The New Daughter',
	  year: 2009,
	  duration: 108,
	  genres: ['Horror', 'Thriller'],
	  rating: 5,
	  description: '\nA single father moves his two children to rural South Carolina, only to watch his daughter exhibit increasingly strange behavior.',
	  url: 'http://www.imdb.com/title/tt0951335/',
	  cover: '/images/MV5BMjAwNTQ2MzM4NF5BMl5BanBnXkFtZTcwMTgzNDcyMw@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMjAwNTQ2MzM4NF5BMl5BanBnXkFtZTcwMTgzNDcyMw@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 28,
	  title: 'The War',
	  year: 1994,
	  duration: 126,
	  genres: ['Drama'],
	  rating: 6,
	  description: '\nVietnam War vet Costner must deal with a war of a different sort between his son and their friends, and a rival group of children. He also must deal with his own personal and employment ...\n',
	  url: 'http://www.imdb.com/title/tt0111667/',
	  cover: '/images/MV5BMTM1NTEyMjcxNF5BMl5BanBnXkFtZTcwNDUyODIyMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTM1NTEyMjcxNF5BMl5BanBnXkFtZTcwNDUyODIyMQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 29,
	  title: 'The Upside of Anger',
	  year: 2005,
	  duration: 118,
	  genres: ['Comedy', 'Drama'],
	  rating: 6,
	  description: '\nWhen her husband unexpectedly disappears, a sharp-witted suburban wife and her daughters juggle their mom\'s romantic dilemmas and family dynamics.',
	  url: 'http://www.imdb.com/title/tt0365885/',
	  cover: '/images/MV5BMTIyODM2MzUzM15BMl5BanBnXkFtZTcwMDQ4MzgyMQ@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTIyODM2MzUzM15BMl5BanBnXkFtZTcwMDQ4MzgyMQ@@._V1_SX640_SY720_-splash.jpg'
	}, {
	  id: 30,
	  title: 'Draft Day',
	  year: 2014,
	  duration: 110,
	  genres: ['Drama', 'Sport'],
	  rating: 6,
	  description: '\nAt the NFL Draft, general manager Sonny Weaver has the opportunity to rebuild his team when he trades for the number one pick. He must decide what he\'s willing to sacrifice on a life-changing day for a few hundred young men with NFL dreams.',
	  url: 'http://www.imdb.com/title/tt2223990/',
	  cover: '/images/MV5BMjAyOTMxMjA3Nl5BMl5BanBnXkFtZTgwMTMwNjQ4MDE@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMjAyOTMxMjA3Nl5BMl5BanBnXkFtZTgwMTMwNjQ4MDE@._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Draft.Day.2014.1080p.BluRay.X264-AMIABLE\\draft.day.2014.1080p.bluray.x264-amiable.rar'
	}, {
	  id: 31,
	  title: '3 Days to Kill',
	  year: 2014,
	  duration: 122,
	  genres: ['Action', 'Drama', 'Thriller'],
	  rating: 6,
	  description: '\nA dying CIA agent trying to reconnect with his estranged daughter is offered an experimental drug that could save his life in exchange for one last assignment.',
	  url: 'http://www.imdb.com/title/tt2172934/',
	  cover: '/images/MV5BMzM0MjE0Nzg1N15BMl5BanBnXkFtZTgwODA4ODE4MDE@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMzM0MjE0Nzg1N15BMl5BanBnXkFtZTgwODA4ODE4MDE@._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\3.Days.to.Kill.2014.EXTENDED.1080p.BluRay.x264-SPARKS\\3.days.to.kill.2014.extended.1080p.bluray.x264-sparks.rar'
	}, {
	  id: 32,
	  title: 'Hatfields & McCoys Part 1',
	  year: 2012,
	  duration: 102,
	  genres: ['Drama', 'History', 'Romance'],
	  rating: 8,
	  description: '\nDramatization of the bitter blood feud between the two families on the West Virginia/Kentucky border in the years after the Civil War.',
	  url: 'http://www.imdb.com/title/tt1985443/',
	  cover: '/images/MV5BNDIyNDUzNzQ0Ml5BMl5BanBnXkFtZTcwNzc5Nzg3Nw@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BNDIyNDUzNzQ0Ml5BMl5BanBnXkFtZTcwNzc5Nzg3Nw@@._V1_SX640_SY720_-1-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Hatfields.and.McCoys.2012.Part.1.REPACK.720p.HDTV.x264-2HD\\hatfields.and.mccoys.2012.part.1.repack.720p.hdtv.x264-2hd.rar'
	}, {
	  id: 33,
	  title: 'Hatfields & McCoys Part 2',
	  year: 2012,
	  duration: 96,
	  genres: ['Drama', 'History', 'Romance'],
	  rating: 8,
	  description: '\nDramatization of the bitter blood feud between the two families on the West Virginia/Kentucky border in the years after the Civil War.',
	  url: 'http://www.imdb.com/title/tt1985443/',
	  cover: '/images/MV5BNDIyNDUzNzQ0Ml5BMl5BanBnXkFtZTcwNzc5Nzg3Nw@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BNDIyNDUzNzQ0Ml5BMl5BanBnXkFtZTcwNzc5Nzg3Nw@@._V1_SX640_SY720_-2-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Hatfields.and.McCoys.2012.Part.2.720p.HDTV.x264-2HD\\hatfields.and.mccoys.2012.part.2.720p.hdtv.x264-2hd.rar'
	}, {
	  id: 34,
	  title: 'Hatfields & McCoys Part 3',
	  year: 2012,
	  duration: 88,
	  genres: ['Drama', 'History', 'Romance'],
	  rating: 8,
	  description: '\nDramatization of the bitter blood feud between the two families on the West Virginia/Kentucky border in the years after the Civil War.',
	  url: 'http://www.imdb.com/title/tt1985443/',
	  cover: '/images/MV5BNDIyNDUzNzQ0Ml5BMl5BanBnXkFtZTcwNzc5Nzg3Nw@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BNDIyNDUzNzQ0Ml5BMl5BanBnXkFtZTcwNzc5Nzg3Nw@@._V1_SX640_SY720_-3-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Hatfields.and.McCoys.2012.Part.3.720p.HDTV.x264-2HD\\hatfields.and.mccoys.2012.part.3.720p.hdtv.x264-2hd.rar'
	}, {
	  id: 35,
	  title: 'Dances with Wolves',
	  year: 1990,
	  duration: 236,
	  genres: ['Adventure', 'Drama', 'Romance'],
	  rating: 8,
	  description: '\nLt. John Dunbar, exiled to a remote western Civil War outpost, befriends wolves and Indians, making him an intolerable aberration in the military.    ',
	  url: 'http://www.imdb.com/title/tt0099348/',
	  cover: '/images/MV5BMTY3OTI5NDczN15BMl5BanBnXkFtZTcwNDA0NDY3Mw@@._V1_SX640_SY720_.jpg',
	  splash: '/images/MV5BMTY3OTI5NDczN15BMl5BanBnXkFtZTcwNDA0NDY3Mw@@._V1_SX640_SY720_-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Dances.with.Wolves.1990.1080p.BluRay.DTS.x264-DON\\137392.part01.rar'
	}, {
	  id: 36,
	  title: 'Criminal',
	  year: 2016,
	  duration: 113,
	  genres: ['Action', 'Crime', 'Drama'],
	  cover: '/images/MV5BMTg0ODc4Mzk2OF5BMl5BanBnXkFtZTgwNDk2MDkyODE@._V1_SX300.jpg',
	  splash: '/images/MV5BMTg0ODc4Mzk2OF5BMl5BanBnXkFtZTgwNDk2MDkyODE@._V1_SX300-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Criminal.2016.720p.BluRay.x264-GECKOS\\criminal.2016.720p.bluray.x264-geckos.rar'
	}, {
	  id: 37,
	  title: 'McFarland, USA',
	  year: 2015,
	  duration: 129,
	  genres: ['Biography', 'Drama', 'Sport'],
	  cover: '/images/MV5BMjMwNjY2Mjk5OV5BMl5BanBnXkFtZTgwODM2NTA0MzE@._V1_SX300.jpg',
	  splash: '/images/MV5BMjMwNjY2Mjk5OV5BMl5BanBnXkFtZTgwODM2NTA0MzE@._V1_SX300-splash.jpg'
	}, {
	  id: 38,
	  title: 'Black or White',
	  year: 2014,
	  duration: 121,
	  genres: ['Drama'],
	  cover: '/images/MV5BMTYyMzE2NTE5MV5BMl5BanBnXkFtZTgwNDI3ODI2MzE@._V1_SX300.jpg',
	  splash: '/images/MV5BMTYyMzE2NTE5MV5BMl5BanBnXkFtZTgwNDI3ODI2MzE@._V1_SX300-splash.jpg',
	  media: '\\\\NAS\\Cos-a-thon\\Black.or.White.2014.1080p.BluRay.x264-GECKOS\\black.or.white.2014.1080p.bluray.x264-geckos.rar'
	}, {
	  id: 39,
	  title: 'Bull Durham',
	  year: 1988,
	  duration: 108,
	  genres: ['Comedy', 'Romance', 'Sport'],
	  cover: '/images/MV5BMzMxMDEzMWUtZDk3NS00MWRiLWJjOGMtN2Q0ZjVhZjU3ODhkXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
	  splash: '/images/MV5BMzMxMDEzMWUtZDk3NS00MWRiLWJjOGMtN2Q0ZjVhZjU3ODhkXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300-splash.jpg'
	}];

	function _extends() {
	  _extends = Object.assign || function (target) {
	    for (var i = 1; i < arguments.length; i++) {
	      var source = arguments[i];

	      for (var key in source) {
	        if (Object.prototype.hasOwnProperty.call(source, key)) {
	          target[key] = source[key];
	        }
	      }
	    }

	    return target;
	  };

	  return _extends.apply(this, arguments);
	}

	class Panel extends Component {
	  constructor(props) {
	    super(props);
	    this.open = this.open.bind(this);
	    props.tag = props.tag || 'div';
	  }

	  open() {
	    const currentOpen = document.querySelector('.panel--open');
	    if (currentOpen) currentOpen.classList.remove('panel--open');
	    this.element.classList.add('panel--open');
	    this.element.scrollIntoView({
	      behavior: 'smooth',
	      inline: 'center'
	    });
	  }

	  render(props) {
	    const attrs = {};
	    attrs.class = props.class ? props.class + ' panel' : 'panel';

	    if (props.default) {
	      attrs.class += ' panel--open';
	    }

	    return h(props.tag, _extends({}, attrs, {
	      ref: element => this.element = element
	    }), 'background' in props && h("img", {
	      class: "panel__background",
	      src: props.background
	    }), h("div", {
	      class: "panel__tab",
	      onClick: this.open
	    }, h("strong", null, props.bullet), h("span", null, props.label), 'meta' in props && h("span", null, props.meta)), h("div", {
	      class: "panel__content"
	    }, props.children));
	  }

	}

	function LibraryItem(props) {
	  return h("li", {
	    class: "library__item"
	  }, h("div", {
	    class: "library__item__cover"
	  }, h("img", {
	    src: props.movie.cover
	  })), h("div", {
	    class: "library__item__content"
	  }, h("h4", null, props.movie.title), h("p", null, props.movie.year, ", ", props.movie.duration + " min"), h("p", null, (props.movie.genres || []).join(', ')), h("div", {
	    class: "library__item__actions"
	  }, props.externalAction, h("button", {
	    type: "button",
	    onClick: () => props.select(props.movie)
	  }, "Add +"))));
	}

	class RandomLibraryItem extends Component {
	  constructor(props) {
	    super(props);
	    this.randomize = this.randomize.bind(this);
	    this.selectItem = this.selectItem.bind(this);
	    this.state = {
	      movie: null
	    };
	  }

	  randomize() {
	    const index = Math.floor(Math.random() * this.props.options.length);
	    this.setState({
	      movie: this.props.options[index]
	    });
	  }

	  selectItem(...args) {
	    this.setState({
	      movie: null
	    });
	    this.props.selectItem(...args);
	  }

	  render(props, state) {
	    if (!props.hide) return;
	    const randomizeButton = h("button", {
	      type: "button",
	      onClick: this.randomize
	    }, "\xA0???\xA0");
	    if (state.movie) return h(LibraryItem, {
	      select: this.selectItem,
	      movie: state.movie,
	      externalAction: randomizeButton
	    });
	    return h("li", {
	      class: "library__item"
	    }, h("div", {
	      class: "library__item__cover"
	    }), h("div", {
	      class: "library__item__content"
	    }, h("h4", null, "Randomize"), randomizeButton));
	  }

	}

	class Library extends Component {
	  constructor(props) {
	    super(props);
	    this.controls = {};
	    this.selectItem = this.selectItem.bind(this);
	    this.updateFilter = this.updateFilter.bind(this);
	    this.state = {
	      movies: movies.slice(),
	      titleFilter: '',
	      titleFilterPattern: /./i,
	      sortProperty: 'title',
	      sortOrder: true
	    };
	  }

	  selectItem(selectedMovie) {
	    this.props.addPlaylistItem(selectedMovie);

	    if (this.state.titleFilter) {
	      this.controls.titleFilter.value = '';
	      this.updateFilter();
	    }
	  }

	  updateFilter() {
	    const titleFilter = this.controls.titleFilter.value;
	    this.setState({
	      titleFilter: titleFilter,
	      titleFilterPattern: new RegExp(titleFilter || '.', 'i'),
	      sortProperty: this.controls.sortProperty.value,
	      sortOrder: !!+this.controls.sortOrder.value
	    });
	  }

	  render(props, state) {
	    const usedMovieIds = props.playlistItems.map(item => item.movie.id);
	    const unusedMovies = state.movies.filter(movie => !usedMovieIds.includes(movie.id));
	    return h(Panel, {
	      tag: "section",
	      id: "library",
	      class: "library",
	      bullet: "+",
	      label: "More",
	      default: true
	    }, h("form", null, h("label", null, "Search"), h("input", {
	      type: "search",
	      onInput: this.updateFilter,
	      ref: element => this.controls.titleFilter = element
	    }), h("label", null, "Sort by"), h("select", {
	      onChange: this.updateFilter,
	      ref: element => this.controls.sortProperty = element
	    }, h("option", {
	      value: "title"
	    }, "Title"), h("option", {
	      value: "year"
	    }, "Year"), h("option", {
	      value: "duration"
	    }, "Duration")), h("label", null, "Order"), h("select", {
	      onChange: this.updateFilter,
	      ref: element => this.controls.sortOrder = element
	    }, h("option", {
	      value: "1"
	    }, "A - Z"), h("option", {
	      value: "0"
	    }, "Z - A"))), h("ul", null, h(RandomLibraryItem, {
	      hide: !state.titleFilter,
	      selectItem: this.selectItem,
	      options: unusedMovies
	    }), unusedMovies.filter(movie => state.titleFilterPattern.test(movie.title)).sort((a, b) => {
	      const order = a[state.sortProperty] > b[state.sortProperty];
	      if (!state.sortOrder) return order ? -1 : 1;
	      return order ? 1 : -1;
	    }).map(movie => {
	      return h(LibraryItem, {
	        key: movie.id,
	        select: this.selectItem,
	        movie: movie
	      });
	    })));
	  }

	}

	class ListItem extends Component {
	  constructor(props) {
	    super(props);
	    this.copyMediaUrl = this.copyMediaUrl.bind(this);
	    this.remove = this.remove.bind(this);
	  }

	  copyMediaUrl() {
	    this.mediaUrlInput.select();
	    document.execCommand('copy');
	    this.props.edit(this.props.movie.id, {
	      startedTime: new Date(),
	      status: 1
	    });
	  }

	  remove() {
	    this.props.remove(this.props.movie.id);
	  }

	  static timeStamp(dateString) {
	    const date = new Date(dateString);
	    return [date.getHours(), date.getMinutes()].map(n => n.toString()).map(s => s.padStart(2, '0')).join(':');
	  }

	  render(props) {
	    const mediaUrl = '\\\\NAS\\Series\\Seinfeld\\Season 8\\Seinfeld.S08E20.The.Millennium.DVDRip.x264-HEiT.mkv';
	    const panelProps = {
	      tag: "li",
	      bullet: `#${props.order}`,
	      label: props.movie.title,
	      meta: props.startedTime && ListItem.timeStamp(props.startedTime) || '',
	      background: props.movie.splash
	    };
	    return h(Panel, _extends({
	      class: "playlist__item"
	    }, panelProps), h("div", {
	      class: "playlist__item__content"
	    }, h("img", {
	      src: props.movie.cover
	    }), h("h3", null, props.movie.title), h("p", null, props.movie.year, ", ", props.movie.duration, " min"), h("p", null, props.movie.genres.join(', ')), h("button", {
	      type: "button",
	      onClick: this.copyMediaUrl
	    }, "\u25B6 Copy URL"), h("input", {
	      type: "text",
	      value: mediaUrl,
	      ref: element => this.mediaUrlInput = element
	    })), !props.status && h("div", {
	      class: "panel__tab playlist__item__remove",
	      onClick: this.remove
	    }, h("strong", null, "\xD7")));
	  }

	}

	class Playlist extends Component {
	  constructor(props) {
	    super(props);
	  }

	  render(props) {
	    return h("section", {
	      class: "playlist"
	    }, h("ol", {
	      class: "panel__container"
	    }, props.items.map((item, index) => {
	      return h(ListItem, _extends({
	        key: item.movie.id,
	        order: index + 1,
	        remove: props.removeItem,
	        edit: props.editItem
	      }, item));
	    })));
	  }

	}

	class Main extends Component {
	  constructor() {
	    super();
	    this.addPlaylistItem = this.addPlaylistItem.bind(this);
	    this.removePlaylistItem = this.removePlaylistItem.bind(this);
	    this.editPlaylistItem = this.editPlaylistItem.bind(this);
	    this.state = {
	      playlistItems: getItem('playlistItems') || []
	    };
	  }

	  addPlaylistItem(movie) {
	    this.setState({
	      playlistItems: this.state.playlistItems.concat({
	        status: 0,
	        movie: movie
	      })
	    });
	  }

	  removePlaylistItem(movieId) {
	    const itemIndex = this.state.playlistItems.findIndex(item => item.movie.id === movieId);
	    if (itemIndex < 0) return console.warn('no such item', movieId);
	    this.setState({
	      playlistItems: [].concat(this.state.playlistItems.slice(0, itemIndex), this.state.playlistItems.slice(itemIndex + 1))
	    });
	  }

	  editPlaylistItem(movieId, changes) {
	    const itemIndex = this.state.playlistItems.findIndex(item => item.movie.id === movieId);
	    if (itemIndex < 0) return console.warn('no such item', movieId);
	    this.setState(state => {
	      Object.assign(state.playlistItems[itemIndex], changes);
	      return {
	        playlistItems: state.playlistItems
	      };
	    });
	  }

	  componentDidUpdate() {
	    setItem('playlistItems', this.state.playlistItems);
	  }

	  render(props, state) {
	    return h("body", {
	      class: "panel__container"
	    }, h(Panel, {
	      tag: "header",
	      bullet: "\u2630",
	      label: "Cosathon #1 2018"
	    }), h(Playlist, {
	      items: state.playlistItems,
	      removeItem: this.removePlaylistItem,
	      editItem: this.editPlaylistItem
	    }), h(Library, {
	      playlistItems: state.playlistItems,
	      addPlaylistItem: this.addPlaylistItem
	    }));
	  }

	}

	render(h(Main, null), document.documentElement, document.body);

}());
