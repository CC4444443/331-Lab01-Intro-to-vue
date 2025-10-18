// 从Vue中引入核心API：createApp（创建应用）
const { createApp } = Vue;

// 1. 创建Vue应用实例
console.debug('main.js: executing, Vue.version=', Vue && Vue.version);
const app = createApp({
    setup() {
        // 购物车：使用对象记录每个商品 id 的数量（{ id: count, ... }）
    const cart = Vue.ref({});
        // 响应式变量：是否为高级用户（控制运费，可修改true/false测试效果）
    const premium = Vue.ref(true);

            // 方法：当子组件 emit 'add-to-cart' 时调用，接收商品 id 参数并累加计数
            function incrementCart(id) {
                if (typeof id === 'undefined') {
                    // 向后兼容：如果没有 id，则不做处理
                    return;
                }
                if (cart.value[id]) {
                    cart.value[id] += 1;
                } else {
                    cart.value[id] = 1;
                }
            }

            // 方法：减少购物车中某个 id 的数量；如果数量减到0则删除该 key
            function decrementCart(id) {
                if (typeof id === 'undefined') return;
                if (!cart.value[id]) return; // nothing to do
                cart.value[id] -= 1;
                if (cart.value[id] <= 0) {
                    // 使用 delete 删除对象键
                    delete cart.value[id];
                }
            }

            // 暴露变量和方法给模板使用
            return {
                cart,
                premium,
                incrementCart,
                decrementCart
            };
    }
});

// 2. 注册全局组件：product-display（组件逻辑在ProductDisplay.js中定义）
app.component('product-display', productDisplay);
// register review components
app.component('review-form', reviewForm);
app.component('review-list', reviewList);

// 3. 挂载应用到HTML中id为"app"的元素
app.mount('#app');
console.debug('main.js: app.mount called');