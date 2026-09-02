import type { ClientStatusState } from './client-status'
import type { StatusResourceView } from './status'

export interface ClientStatusNotice {
  color: 'info' | 'warning'
  icon: '$infoOutline' | '$alertCircleOutline'
  message: string
  role: 'status' | 'alert'
}

/** 下载对话框中的客户端状态提示：请求进度与同步状态到文案、图标与无障碍角色的映射。 */
export function clientStatusNotice(
  loadState: ClientStatusState,
  resource?: StatusResourceView
): ClientStatusNotice | null {
  if (loadState === 'loading') {
    return {
      color: 'info',
      icon: '$infoOutline',
      message: '正在检查客户端状态……',
      role: 'status'
    }
  }

  if (loadState === 'failed') {
    return {
      color: 'warning',
      icon: '$alertCircleOutline',
      message: '暂时无法确认该客户端状态。你仍可继续下载，安装前请留意版本兼容性。',
      role: 'alert'
    }
  }

  if (!resource || resource.status.state === 'loading') {
    return {
      color: 'warning',
      icon: '$alertCircleOutline',
      message: '暂时未取得该客户端状态。你仍可继续下载，安装前请留意版本兼容性。',
      role: 'alert'
    }
  }

  if (resource.status.state === 'error') {
    return {
      color: 'warning',
      icon: '$alertCircleOutline',
      message: '本地化客户端可能尚未同步到最新官方版本。你仍可继续下载。',
      role: 'alert'
    }
  }

  return null
}
