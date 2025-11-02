/**
 * 音乐管理器模块
 * 负责背景音乐的预加载和播放控制
 */

import { CONFIG } from './config.js'

class AudioManager {
	constructor() {
		this.audio = null
		this.isLoaded = false
		this.isPlaying = false
		this.hasPlayed = false // 新增：记录是否已经播放过
	}

	/**
	 * 预加载音乐文件
	 * @returns {Promise<void>}
	 */
	async preload() {
		return new Promise((resolve, reject) => {
			try {
				this.audio = new Audio('/notes/music.m4a')
				this.audio.loop = true
				this.audio.volume = 0.3 // 默认音量 30%

				// 监听加载完成事件
				this.audio.addEventListener('canplaythrough', () => {
					this.isLoaded = true
					if (CONFIG.DEBUG) console.log('背景音乐加载完成')
					resolve()
				}, { once: true })

				// 监听加载错误
				this.audio.addEventListener('error', (e) => {
					console.error('背景音乐加载失败:', e)
					// 即使音乐加载失败，也允许继续进入应用
					resolve()
				}, { once: true })

				// 开始加载
				this.audio.load()

				// 设置超时，避免无限等待
				setTimeout(() => {
					if (!this.isLoaded) {
						if (CONFIG.DEBUG) console.log('音乐加载超时，继续进入应用')
						resolve()
					}
				}, 5000) // 5秒超时
			} catch (error) {
				console.error('音乐管理器初始化失败:', error)
				resolve() // 失败也继续
			}
		})
	}

	/**
	 * 播放音乐
	 */
	async play() {
		if (!this.audio || !this.isLoaded) {
			if (CONFIG.DEBUG) console.log('音乐未加载，无法播放')
			return
		}

		// 新增：检查是否已经播放过，如果播放过则跳过
		if (this.hasPlayed) {
			if (CONFIG.DEBUG) console.log('音乐已经播放过，跳过重复播放')
			return
		}

		try {
			// 现代浏览器需要用户交互才能播放音频
			await this.audio.play()
			this.isPlaying = true
			this.hasPlayed = true // 标记为已播放
			if (CONFIG.DEBUG) console.log('背景音乐开始播放')
		} catch (error) {
			// 自动播放被阻止是正常的，可以忽略
			if (CONFIG.DEBUG) console.log('音乐自动播放被阻止:', error.message)
		}
	}

	/**
	 * 暂停音乐
	 */
	pause() {
		if (this.audio && this.isPlaying) {
			this.audio.pause()
			this.isPlaying = false
			if (CONFIG.DEBUG) console.log('背景音乐已暂停')
		}
	}

	/**
	 * 切换播放/暂停
	 */
	async toggle() {
		if (this.isPlaying) {
			this.pause()
		} else {
			await this.play()
		}
		return this.isPlaying
	}

	/**
	 * 设置音量
	 * @param {number} volume - 音量值 (0-1)
	 */
	setVolume(volume) {
		if (this.audio) {
			this.audio.volume = Math.max(0, Math.min(1, volume))
		}
	}

	/**
	 * 重置播放状态，允许音乐再次播放
	 */
	resetPlayState() {
		this.hasPlayed = false
		this.isPlaying = false
		if (CONFIG.DEBUG) console.log('音乐播放状态已重置')
	}

	/**
	 * 销毁音乐管理器
	 */
	destroy() {
		if (this.audio) {
			this.pause()
			this.audio.src = ''
			this.audio = null
		}
		this.isLoaded = false
		this.isPlaying = false
		this.hasPlayed = false
	}
}

// 导出单例
export const audioManager = new AudioManager()