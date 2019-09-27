class Compile {
	constructor(el, vm) {
	    // vm 是compile 实例
		this.el = this.isElementNode(el)?el:document.querySelector(el)
		this.vm = vm
		
		if(this.el){
			// 如果这个元素能获取到  能编译
			// 1. 先把真实的 dom 放到内存中 fragment
			let fragment = this.node2fragment(this.el)
			// 2. 编译  提取想要的元素节点 v-model 和文本节点 {{}}
			this.compile(fragment)
			
			// 3. 把编译好的fragment 塞回页面去
			this.el.appendChild(fragment)
		}
	}
	
	// 专门写一些辅助方法  元素是不是元素， 是不是文本
	isElementNode(node){
		return node.nodeType === 1 ; // 元素节点是1  属性节点是2
	}
	
	// 核心方法 
	
	// 是否是指令
	isDirective(name){
		return name.includes('v-')
	}
	compileElement(node){
		let attrs = node.attributes; // 取出当前节点属性
		Array.from(attrs).forEach(attr=>{
			// 判断属性名字 是不是包含 v-
			if(this.isDirective(attr.name)){
				// 把取到的值 放到节点中
				let expr = attr.value
				//let type = attr.name.slice(2)  //v-
				let [,type] = attr.name.split('-')
				// node vm.$data expr
				CompileUtil[type](node,this.vm, expr)
			}
		})
	}
	compileText(node){
		let expr = node.textContent;
		let reg = /\{\{([^}]+)\}\}/g
		if(reg.test(expr)){
			// node this.vm.$data expr
			CompileUtil['text'](node, this.vm, expr)
		}
	}
	compile(fragment){
		// 需要递归
		let childNodes = fragment.childNodes; // 空格是文本节点
		Array.from(childNodes).forEach(node=>{
			if(this.isElementNode(node)){
				//是元素节点, 需要继续深入检查
				this.compileElement(node)
				this.compile(node)
			}else{
				// 文本节点 需要编译文本
				this.compileText(node)
			}
		})
	}
	node2fragment(el){
		// 需要将el 中的内容全部放到 内存中
		
		// 创建文档碎片  内存中dom节点
		let fragment = document.createDocumentFragment()
		
		let firstChild;
		while(firstChild = el.firstChild){
			fragment.appendChild(firstChild)
		}
		return fragment
	}
}



CompileUtil = {
	getVal(vm, expr){
		expr = expr.split('.') // [message,a]
		return expr.reduce((prev, next)=>{
			return prev[next]
		},vm.$data)
	},
	getTextVal(vm, expr){ // 获取编译文本后的节点
		return expr.replace(/\{\{([^}]+)\{\{/g,(...arguments)=>{
			return this.getVal(vm, arguments[1])
		})
	},
	text(node , vm, expr){ // 文本处理
		let updateFn = this.updater['textUpdater']
		let value = this.getTextVal(vm, expr)
		updateFn && updateFn(node, value)
	},
	model(node, vm, expr){  // 输入框处理
		let updateFn = this.updater['modelUpdater']
		updateFn && updateFn(node,this.getVal(vm,expr))
	},
	updater:{
		//文本更新
		textUpdater(node,value){
			node.textContent = value
		},
		//输入框更新
		modelUpdater(node, value){
			node.value = value
		}
	}
}