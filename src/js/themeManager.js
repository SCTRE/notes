/**
 * 主题管理模块
 * 负责主题切换、状态持久化和UI更新
 */

import { CONFIG } from './config.js'

/**
 * 主题管理器
 */
export class ThemeManager {
	constructor() {
		this.currentTheme = this.getInitialTheme()
		this.themeToggleBtn = null
		this.themeIcon = null
	}

	/**
	 * 获取初始主题（优先从 localStorage 读取，默认为黑暗模式）
	 */
	getInitialTheme() {
		const savedTheme = localStorage.getItem('theme')
		return savedTheme || 'light'
	}

	/**
	 * 初始化主题
	 */
	init() {
		this.themeToggleBtn = document.getElementById('themeToggle')
		this.themeIcon = this.themeToggleBtn?.querySelector('.theme-toggle-icon')

		// 应用初始主题
		this.applyTheme(this.currentTheme, false)

		// 绑定切换事件
		if (this.themeToggleBtn) {
			this.themeToggleBtn.addEventListener('click', () => {
				this.toggleTheme()
			})
		}
	}

	/**
	 * 切换主题
	 */
	toggleTheme() {
		const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
		this.applyTheme(newTheme, true)
	}

	/**
	 * 应用主题
	 * @param {string} theme - 主题名称 ('dark' 或 'light')
	 * @param {boolean} animate - 是否启用动画效果（已废弃，CSS自动处理）
	 */
	applyTheme(theme, animate = false) {
		this.currentTheme = theme

		// 使用 requestAnimationFrame 确保平滑更新
		requestAnimationFrame(() => {
			// 更新 body 类名
			if (theme === 'light') {
				document.body.classList.add('light-theme')
			} else {
				document.body.classList.remove('light-theme')
			}

			// 更新图标
			this.updateIcon(theme)

			// 保存到 localStorage
			localStorage.setItem('theme', theme)

			// 触发自定义事件，通知其他模块主题已改变
			document.dispatchEvent(new CustomEvent('themechange', {
				detail: { theme }
			}))
		})
	}

	/**
	 * 更新主题图标
	 * @param {string} theme - 主题名称
	 */
	updateIcon(theme) {
		if (!this.themeIcon) return

		if (theme === 'light') {
			this.themeIcon.textContent = '☀️'
		} else {
			this.themeIcon.textContent = '🌙'
		}
	}

	/**
	 * 获取当前主题对应的颜色数组
	 * @returns {Array<string>} 颜色数组
	 */
	getColors() {
		return this.currentTheme === 'dark'
			? CONFIG.COLORS
			: CONFIG.COLORS_LIGHT
	}

	/**
	 * 获取当前主题
	 * @returns {string} 当前主题名称
	 */
	getCurrentTheme() {
		return this.currentTheme
	}
}

// 创建单例实例
export const themeManager = new ThemeManager()
