import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["modal", "credentialPath", "statusMessage"]
  
  connect() {
    console.log("Config controller connected")
    console.log("Modal target:", this.hasModalTarget)
    this.configId = null
    this.loadExistingConfig()
  }
  
  async loadExistingConfig() {
    // In real app, we would load existing config from API
  }
  
  openModal() {
    console.log("Opening modal...")
    if (!this.hasModalTarget) {
      console.error("Modal target not found!")
      return
    }
    this.modalTarget.classList.remove("hidden")
  }
  
  closeModal(event) {
    if (event) {
      event.preventDefault()
    }
    this.modalTarget.classList.add("hidden")
  }
  
  closeModalOnBackdrop(event) {
    // Only close if clicking on the backdrop (not the modal content)
    if (event.target === this.modalTarget) {
      this.modalTarget.classList.add("hidden")
    }
  }
  
  stopPropagation(event) {
    event.stopPropagation()
  }
  
  async testConnection() {
    const credentialPath = this.credentialPathTarget.value
    
    if (!credentialPath) {
      this.showMessage("경로를 입력해주세요", "error")
      return
    }
    
    // First save the config
    const saveResponse = await this.saveConfig(credentialPath)
    if (!saveResponse.success) return
    
    // Then validate it
    try {
      const response = await fetch(`/api/configurations/${this.configId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showMessage(data.message, "success")
      } else {
        this.showMessage(data.message, "error")
      }
    } catch (error) {
      this.showMessage("연결 테스트 실패: " + error.message, "error")
    }
  }
  
  async save(event) {
    event.preventDefault()
    
    const credentialPath = this.credentialPathTarget.value
    
    if (!credentialPath) {
      this.showMessage("경로를 입력해주세요", "error")
      return
    }
    
    const response = await this.saveConfig(credentialPath)
    
    if (response.success) {
      this.showMessage("설정이 저장되었습니다", "success")
      setTimeout(() => {
        this.closeModal()
        window.location.reload()
      }, 1000)
    }
  }
  
  async saveConfig(credentialPath) {
    try {
      const response = await fetch('/api/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configuration: { credential_path: credentialPath },
          id: this.configId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.configId = data.id
        return { success: true }
      } else {
        this.showMessage("저장 실패: " + (data.errors ? data.errors.join(", ") : "Unknown error"), "error")
        return { success: false }
      }
    } catch (error) {
      this.showMessage("저장 실패: " + error.message, "error")
      return { success: false }
    }
  }
  
  showMessage(message, type) {
    this.statusMessageTarget.textContent = message
    this.statusMessageTarget.classList.remove("hidden", "bg-green-100", "text-green-800", "bg-red-100", "text-red-800")
    
    if (type === "success") {
      this.statusMessageTarget.classList.add("bg-green-100", "text-green-800")
    } else {
      this.statusMessageTarget.classList.add("bg-red-100", "text-red-800")
    }
  }
}