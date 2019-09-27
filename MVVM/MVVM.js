class MVVM{ // 桥梁
	constructor(options) {
	    // 先把可用的东西挂载在实例上
		this.$el = options.el
		this.$data = options.data
		
		// 如果有要编译的模板 就开始编译
		if(this.$el){
			// 用数据 和元素 进行编译
			new Compile(this.$el, this)
		}
	}
}