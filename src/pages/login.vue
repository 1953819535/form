<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

definePage({
  meta: {
    layout: "blank",
    hideMenu: true,
  },
});

// 表单数据
const form = ref({
  username: "",
  password: "",
  remember: false,
});

// 交互状态
const isPasswordFocused = ref(false);
const isUsernameFocused = ref(false);
const mousePosition = ref({ x: 0, y: 0 });
const isLoaded = ref(false);

// 计算光标跟随效果
const cursorStyle = computed(() => ({
  transform: `translate(${mousePosition.value.x * 20}px, ${mousePosition.value.y * 20}px)`,
}));

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);

  // 鼠标移动追踪
  document.addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mousePosition.value = {
      x: (clientX / innerWidth - 0.5) * 2,
      y: (clientY / innerHeight - 0.5) * 2,
    };
  });
});

// 提交处理
const handleSubmit = () => {
  console.log("登录", form.value);
};
</script>

<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAFAFA] overflow-hidden">
    <!-- 左侧视觉区域 -->
    <div class="relative bg-[#0D0D0D] hidden lg:flex flex-col justify-center p-16 overflow-hidden">
      <!-- 网格背景 -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- 线条网格 -->
        <div
          class="absolute inset-0 opacity-50"
          style="background-image: linear-gradient(rgba(255,77,77,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,77,77,0.15) 1px, transparent 1px); background-size: 60px 60px;"
        ></div>
        <!-- 点阵网格 -->
        <div
          class="absolute inset-0 opacity-30"
          style="background-image: radial-gradient(circle, #FF4D4D 1px, transparent 1px); background-size: 60px 60px;"
        ></div>
      </div>

      <!-- 浮动元素 -->
      <div
        class="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
        :style="cursorStyle"
      >
        <!-- 方形 -->
        <div
          class="absolute w-[200px] h-[200px] top-[15%] right-[10%] border-2 border-[#FF4D4D] opacity-40 rotate-45 animate-pulse"
          style="animation: pulse-shape 4s ease-in-out infinite;"
        ></div>
        <!-- 圆形 -->
        <div
          class="absolute w-[120px] h-[120px] bottom-[20%] left-[15%] border-2 border-[#FF4D4D] rounded-full opacity-40"
          style="animation: pulse-shape 5s ease-in-out infinite reverse;"
        ></div>
        <!-- 实心方块 -->
        <div
          class="absolute w-[80px] h-[80px] top-[60%] right-[25%] bg-[#FF4D4D] opacity-20"
          style="animation: pulse-shape 3s ease-in-out infinite;"
        ></div>
      </div>

      <!-- 品牌区域 -->
      <div class="relative z-10">
        <!-- Logo -->
        <div class="w-20 h-20 text-[#FF4D4D] mb-8 animate-fade-up">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="72" height="72" stroke="currentColor" stroke-width="3"/>
            <rect x="16" y="16" width="48" height="48" fill="currentColor"/>
            <rect x="28" y="28" width="24" height="24" stroke="white" stroke-width="2"/>
          </svg>
        </div>

        <!-- 品牌名 -->
        <h1 class="font-['Syne'] text-[3.5rem] font-extrabold text-white tracking-[-0.03em] mb-6 leading-none animate-fade-up" style="animation-delay: 0.1s;">
          Admin Starter
        </h1>

        <!-- 标语 -->
        <div class="flex items-center gap-4 animate-fade-up" style="animation-delay: 0.2s;">
          <div class="w-10 h-0.5 bg-[#FF4D4D]"></div>
          <span class="font-['Space_Mono'] text-sm text-[#A3A3A3] tracking-widest uppercase">
            Vue3 后台系统快速开发模板
          </span>
        </div>
      </div>

      <!-- 装饰字母 -->
      <div class="absolute bottom-16 right-16 flex gap-2 z-10">
        <span class="font-['Syne'] text-[8rem] font-extrabold leading-none text-transparent transition-all duration-300 hover:text-[#FF4D4D] cursor-pointer" style="-webkit-text-stroke: 1px rgba(255,255,255,0.1);">F</span>
        <span class="font-['Syne'] text-[8rem] font-extrabold leading-none text-transparent transition-all duration-300 hover:text-[#FF4D4D] hover:-translate-y-2 cursor-pointer" style="-webkit-text-stroke: 1px rgba(255,255,255,0.1);">O</span>
        <span class="font-['Syne'] text-[8rem] font-extrabold leading-none text-transparent transition-all duration-300 hover:text-[#FF4D4D] hover:-translate-y-2 cursor-pointer" style="-webkit-text-stroke: 1px rgba(255,255,255,0.1);">R</span>
        <span class="font-['Syne'] text-[8rem] font-extrabold leading-none text-transparent transition-all duration-300 hover:text-[#FF4D4D] hover:-translate-y-2 cursor-pointer" style="-webkit-text-stroke: 1px rgba(255,255,255,0.1);">M</span>
      </div>

      <!-- 底部装饰条 -->
      <div class="absolute bottom-0 left-0 right-0 h-1.5 flex">
        <div class="flex-1 bg-[#FF4D4D]"></div>
        <div class="w-[100px] bg-white"></div>
      </div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="relative flex flex-col justify-center px-12 lg:px-24 py-16 bg-[#FAFAFA]">
      <!-- 顶部装饰 -->
      <div class="absolute top-8 right-8 flex items-center gap-4">
        <div class="w-2 h-2 bg-[#FF4D4D] rounded-full"></div>
        <div class="w-10 h-px bg-[#E5E5E5]"></div>
        <span class="font-['Space_Mono'] text-xl text-[#A3A3A3]">+</span>
      </div>

      <!-- 表单内容 -->
      <div
        class="transition-all duration-700 ease-out"
        :class="isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'"
      >
        <!-- 欢迎区域 -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <span class="font-['Space_Mono'] text-xs font-bold text-[#FF4D4D]">01</span>
            <span class="font-['Space_Mono'] text-xs text-[#A3A3A3] tracking-widest uppercase">登录系统</span>
          </div>
          <h2 class="mb-4">
            <span class="block font-['Syne'] text-[2.5rem] lg:text-[2.75rem] font-bold text-[#1A1A1A] leading-tight tracking-[-0.02em]">开始你的</span>
            <span class="block font-['Syne'] text-[2.5rem] lg:text-[2.75rem] font-bold text-[#FF4D4D] leading-tight tracking-[-0.02em] relative">
              创造之旅
              <span class="absolute bottom-1 left-0 right-0 h-1.5 bg-[#FF4D4D] opacity-20"></span>
            </span>
          </h2>
          <p class="font-['Space_Mono'] text-sm text-[#525252]">输入你的凭证，解锁无限可能</p>
        </div>

        <!-- 表单 -->
        <a-form layout="vertical" @finish="handleSubmit" class="flex flex-col gap-6">
          <!-- 用户名 -->
          <a-form-item>
            <template #label>
              <div class="flex items-center gap-2 font-['Space_Mono'] text-xs font-medium text-[#1A1A1A] uppercase tracking-wider">
                <span class="w-[18px] h-[18px] transition-colors" :class="isUsernameFocused ? 'text-[#FF4D4D]' : 'text-[#A3A3A3]'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                  </svg>
                </span>
                <span>用户名</span>
                <span class="text-[#FF4D4D] text-base">*</span>
              </div>
            </template>
            <a-input
              v-model:value="form.username"
              size="large"
              placeholder="输入用户名"
              class="!bg-[#FAFAFA] !border-2 !border-[#E5E5E5] !rounded-none hover:!border-[#A3A3A3] focus-within:!border-[#FF4D4D] focus-within:!shadow-[4px_4px_0_#FF4D4D] transition-all"
              @focus="isUsernameFocused = true"
              @blur="isUsernameFocused = false"
            />
          </a-form-item>

          <!-- 密码 -->
          <a-form-item>
            <template #label>
              <div class="flex items-center gap-2 font-['Space_Mono'] text-xs font-medium text-[#1A1A1A] uppercase tracking-wider">
                <span class="w-[18px] h-[18px] transition-colors" :class="isPasswordFocused ? 'text-[#FF4D4D]' : 'text-[#A3A3A3]'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="5" y="11" width="14" height="10" rx="2"/>
                    <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                    <path d="M8 11V7a4 4 0 1 1 8 0v4"/>
                  </svg>
                </span>
                <span>密码</span>
                <span class="text-[#FF4D4D] text-base">*</span>
              </div>
            </template>
            <a-input-password
              v-model:value="form.password"
              size="large"
              placeholder="输入密码"
              class="!bg-[#FAFAFA] !border-2 !border-[#E5E5E5] !rounded-none hover:!border-[#A3A3A3] focus-within:!border-[#FF4D4D] focus-within:!shadow-[4px_4px_0_#FF4D4D] transition-all"
              @focus="isPasswordFocused = true"
              @blur="isPasswordFocused = false"
            />
          </a-form-item>

          <!-- 选项行 -->
          <div class="flex justify-between items-center mt-2">
            <a-checkbox v-model:checked="form.remember">
              <span class="font-['Space_Mono'] text-xs text-[#525252]">记住登录</span>
            </a-checkbox>
            <a href="#" class="group flex items-center gap-2 font-['Space_Mono'] text-xs text-[#1A1A1A] no-underline hover:text-[#FF4D4D] transition-colors">
              <span>忘记密码?</span>
              <svg class="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H7M17 7v10"/>
              </svg>
            </a>
          </div>

          <!-- 提交按钮 -->
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            class="!h-14 !bg-[#1A1A1A] !border-none !rounded-none font-['Syne'] !text-base !font-semibold tracking-wide overflow-hidden relative group hover:!bg-[#FF4D4D] transition-colors duration-300"
          >
            <span class="relative z-10 flex items-center justify-center gap-3 text-white">
              <span>登录系统</span>
              <svg class="w-[18px] h-[18px] stroke-white transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </a-button>
        </a-form>

        <!-- 底部链接 -->
        <div class="mt-12 pt-8">
          <div class="flex items-center gap-4 mb-6">
            <div class="flex-1 h-px bg-[#E5E5E5]"></div>
            <span class="font-['Space_Mono'] text-[0.65rem] text-[#A3A3A3] tracking-widest">OR</span>
            <div class="flex-1 h-px bg-[#E5E5E5]"></div>
          </div>
          <div class="flex items-center justify-center gap-2">
            <span class="font-['Space_Mono'] text-sm text-[#525252]">还没有账号?</span>
            <a href="#" class="relative font-['Space_Mono'] text-sm font-semibold text-[#FF4D4D] no-underline group">
              <span>立即注册</span>
              <span class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#FF4D4D] scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-300"></span>
            </a>
          </div>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 font-['Space_Mono'] text-[0.65rem] text-[#A3A3A3]">
        <span>© 2026 Vue3 Admin Starter</span>
        <span class="text-[8px]">·</span>
        <span>All rights reserved</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&display=swap');

/* 动画关键帧 */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-shape {
  0%, 100% {
    transform: rotate(45deg) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: rotate(45deg) scale(1.1);
    opacity: 0.6;
  }
}

.animate-fade-up {
  animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

/* Ant Design 覆盖样式 */
:deep(.ant-input) {
  font-family: 'Space Mono', monospace !important;
  font-size: 1rem !important;
  color: #1A1A1A !important;
  background: transparent !important;
}

:deep(.ant-input::placeholder) {
  color: #A3A3A3 !important;
}

:deep(.ant-input-password-icon) {
  color: #A3A3A3 !important;
}

:deep(.ant-checkbox-inner) {
  width: 20px !important;
  height: 20px !important;
  border: 2px solid #E5E5E5 !important;
  border-radius: 0 !important;
  background: transparent !important;
  transition: all 0.2s ease !important;
}

:deep(.ant-checkbox:hover .ant-checkbox-inner) {
  border-color: #FF4D4D !important;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background: #FF4D4D !important;
  border-color: #FF4D4D !important;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner::after) {
  border-color: white !important;
  width: 6px !important;
  height: 10px !important;
  top: 45% !important;
}

:deep(.ant-form-item-label > label) {
  height: auto !important;
}
</style>
