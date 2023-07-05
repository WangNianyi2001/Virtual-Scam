export class Control extends EventTarget {
	constructor($) {
		super();
		this.$ = $;
		this.parent = null;
		this.children = [];
	}
	get size() {
		return [this.element.offsetWidth, this.element.offsetHeight];
	}
	get pagePos() {
		return [this.element.offsetLeft, this.element.offsetTop];
	}

	AttachTo(parent, base = null) {
		if(this.parent) {
			this.Destroy();
			this.parent = null;
		}
		if(parent !== null) {
			this.parent = parent;
			if(base === null)
				base = this.parent.$;
			base.appendChild(this.$);
		}
	}

	Destroy() {
		this.$.parentNode?.removeChild(this.$);
		if(this.parent) {
			const index = this.parent.children.indexOf(this);
			if(index !== -1)
				this.parent.children.splice(index, 1);
			for(const child of this.children)
				child.Destroy();
		}
	}
};

export class Page extends Control {
	get name() { return this.$.id; }

	constructor($) {
		super($);
		Page.pages.add(this);
		if(Page.current === null)
			this.Show();
	}

	DispatchPageEvent(type) {
		const pe = new Event(type);
		pe.page = this;
		if(!this.dispatchEvent(pe))
			return false;
		const de = new Event('page' + type);
		de.page = this;
		return document.dispatchEvent(de);
	}

	Destroy() {
		Page.pages.delete(this);
		super.Destroy();
	}

	Show() {
		if(Page.current === this)
			return;
		if(Page.current && !Page.current.Hide())
			return false;
		if(!this.DispatchPageEvent('show'))
			return false;
		this.$.classList.add('active');
		Page.current = this;
		return true;
	}
	Hide() {
		if(!this.DispatchPageEvent('hide'))
			return false;
		Page.current = null;
		this.$.classList.remove('active');
		return true;
	}
}
Page.current = null;
Page.pages = new Set();
Page.Find = function(name) {
	for(const page of Page.pages)
		if(page.name === name)
			return page;
	return null;
};

document.addEventListener('click', function(ev) {
	if('pageNav' in ev.target.dataset) {
		const pageName = ev.target.dataset.pageNav;
		const page = Page.Find(pageName);
		if(!page)
			return;
		if(page.DispatchPageEvent('choose'))
			page.Show();
	}
});

for(const $section of document.body.getElementsByClassName('page'))
	new Page($section);
