export class Control {
	constructor($) {
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
	constructor($) {
		super($);
		Page.pages.set(this.$.id, this);
		if(Page.current === null)
			this.Show();
	}
	Destroy() {
		Page.pages.set(this.$, this);
		super.Destroy();
	}
	Show() {
		Page.current?.Hide();
		this.$.classList.add('active');
		Page.current = this;
	}
	Hide() {
		Page.current = null;
		this.$.classList.remove('active');
	}
}
Page.current = null;
Page.pages = new Map();
Page.Find = function(id) {
	return Page.pages.get(id) || null;
};

for(const $section of document.body.getElementsByTagName('section'))
	new Page($section);
