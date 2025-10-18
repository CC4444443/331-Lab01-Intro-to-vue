// 从Vue中引入组件所需API
console.debug('ProductDisplay.js: executing');

// 定义product-display组件（使用 IIFE 局部化对 Vue API 的解构，避免与其他脚本冲突）
const productDisplay = (function(){
    const { ref, computed } = Vue;

    // 组件主体
    const productDetailsLocal = {
        props: { details: Array },
        template: `
            <div class="product-details">
                <h3>Product Details</h3>
                <ul>
                    <li v-for="(d, i) in details" :key="i">{{ d }}</li>
                </ul>
            </div>
        `
    };

    return {
        components: {
            'product-details': productDetailsLocal
        },
    // 1. 组件模板（HTML结构）
    template:
        /*html*/
        `
        <div class="product-display">
            <!-- 产品图片区域 -->
            <div class="product-container">
                <div class="product-image">
                    <img :src="image">
                </div>
            </div>

            <!-- 产品信息区域 -->
            <div class="product-info">
                <!-- 产品标题（计算属性：brand + product） -->
                <h1>{{ title }}</h1>
                <!-- 库存状态（根据inventory判断） -->
                <p v-if="inventory > 10">In Stock</p>
                <p v-else-if="inventory <= 10 && inventory > 0">Almost out of Stock</p>
                <p v-else>Out of Stock</p>
                <!-- 运费显示（计算属性：根据premium判断是否免费） -->
                <p>Shipping: {{ shipping }}</p>
                <!-- 产品详情：使用 product-details 组件显示 -->
                <product-details :details="details"></product-details>
                <!-- 产品颜色选项（鼠标悬浮切换图片） -->
                <div 
                    v-for="(variant, index) in variants" 
                    :key="variant.id" 
                    @mouseover="updateVariant(index)"
                    class="color-circle" 
                    :style="{ backgroundColor: variant.color }"
                >
                </div>
                <!-- 加入购物车按钮（根据inStock禁用，添加禁用样式） -->
                <button 
                    class="button" 
                    :disabled="!inStock" 
                    @click="addToCart" 
                    :class="{ disabledButton: !inStock }"
                >
                    Add To Cart
                </button>

                <!-- 移除购物车按钮：点击时 emit 当前选中变体 id，供父组件处理减少/删除 -->
                <button 
                    class="button remove-button" 
                    @click="removeFromCart"
                >
                    Remove From Cart
                </button>
                <!-- 评论列表（仅当有评论时显示） -->
                <review-list v-if="reviews.length" :reviews="reviews"></review-list>
                <!-- 评论表单：提交时触发 review-submitted 事件 -->
                <review-form @review-submitted="addReview"></review-form>
            </div>
        </div>
        `,

    // 2. 接收父组件传递的属性（premium：布尔值，判断是否为高级用户）
    props: {
        premium: Boolean
    },

    // 3. 组件逻辑（响应式数据、方法、计算属性）
    setup(props, { emit }) {
        // 基础响应式数据
        const product = ref('Boots'); // 产品名称
        const brand = ref('SE 331'); // 品牌名称
        const inventory = ref(100); // 总库存（备用，实际库存优先取variant.quantity）
        const details = ref([ // 产品详情数组
            '50% cotton',
            '30% wool',
            '20% polyester'
        ]);
        const variants = ref([ // 产品变体（颜色、图片、库存）
            { id: 2234, color: 'green', image: './assets/images/socks_green.jpg', quantity: 50 },
            { id: 2235, color: 'blue', image: './assets/images/socks_blue.jpg', quantity: 0 }
        ]);
        const selectedVariant = ref(0); // 当前选中的变体索引（默认选第一个）
        const reviews = Vue.ref([]); // 存储评论的数组
    // 不在组件内部维护 cart，改为通过 emit 通知父组件

        // 方法1：更新选中的变体（鼠标悬浮颜色时触发）
        function updateVariant(index) {
            selectedVariant.value = index;
        }

        // 方法2：加入购物车（暂时修改组件内部cart，后续会通过事件传递给父组件）
        function updateImage(variantImage) {
            // 兼容早期逻辑，实际已被updateVariant替代，可保留备用
            const image = ref(variantImage);
        }

        // 方法3：加入购物车（组件内部逻辑）
        // 现在在 emit 中传递当前选中变体的 id，供父组件按 id 计数
        function addToCart() {
            const id = variants.value[selectedVariant.value].id;
            emit('add-to-cart', id);
        }

        // 方法4：从购物车移除（或减少数量）
        // emit 'remove-from-cart' 并传递当前选中变体的 id
        function removeFromCart() {
            const id = variants.value[selectedVariant.value].id;
            emit('remove-from-cart', id);
        }

        // 评论相关：接收来自 review-form 的 review 并存储
        function addReview(review){
            reviews.value.push(review);
            console.log('Reviews updated:', reviews.value);
        }

        // 计算属性1：当前选中变体的图片（根据selectedVariant动态获取）
        const image = computed(() => {
            return variants.value[selectedVariant.value].image;
        });

        // 计算属性2：当前选中变体的库存（判断是否可购买）
        const inStock = computed(() => {
            return variants.value[selectedVariant.value].quantity > 0;
        });

        // 计算属性3：产品标题（品牌+名称，避免模板内计算）
        const title = computed(() => {
            return brand.value + ' ' + product.value;
        });

        // 计算属性4：运费（根据父组件传递的premium判断：高级用户免费，否则30）
        const shipping = computed(() => {
            if (props.premium) {
                return 'Free';
            } else {
                return 30;
            }
        });

        // 暴露属性、方法给模板使用
        return {
            title,
            image,
            inStock,
            inventory,
            details,
            variants,
            addToCart,
            removeFromCart,
            reviews,
            addReview,
            updateImage,
            updateVariant,
            shipping // 暴露运费计算属性
        };
    }
    };
})();