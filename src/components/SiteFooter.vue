<template>
  <v-footer class="site-footer">
    <v-container max-width="1120">
      <div class="footer-inner">
        <div class="footer-left">
          <strong>蔚蓝咖啡厅</strong>
          <p>Copyright © 2026 BlueArchive.Cafe. All rights reserved.</p>
          <p>“蔚蓝咖啡厅”是由爱好者创立并维护的民间项目，与游戏“ブルーアーカイブ（中文名‘蔚蓝档案’）”及相关公司并无官方关联。</p>
          <div class="friend-links" aria-label="友情链接">
            <span>友情链接</span>
            <a
              v-for="link in friendLinks"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </div>
        <div class="footer-right">
          <div class="footer-links">
            <RouterLink to="/">首页</RouterLink>
            <RouterLink to="/news">新闻</RouterLink>
            <RouterLink to="/about">关于</RouterLink>
          </div>
          <div class="beian-list" aria-label="备案信息">
            <a
              class="beian-link"
              href="https://beian.miit.gov.cn/"
              title="工业和信息化部备案管理系统"
              target="_blank"
              rel="noopener noreferrer"
            >
              皖 ICP 备 2026002949 号-1
            </a>
            <a
              class="beian-link"
              href="https://beian.mps.gov.cn/#/query/webSearch?code=34010402704707"
              title="全国互联网安全管理服务平台"
              target="_blank"
              rel="noopener noreferrer"
            >
              皖公网安备 34010402704707 号
            </a>
          </div>
        </div>
      </div>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const friendLinks = [
  {
    label: 'ブルーアーカイブ',
    href: 'https://bluearchive.jp/'
  },
  {
    label: 'Yostar JP',
    href: 'https://www.yostar.co.jp/'
  },
  {
    label: 'Shittim Canvas',
    href: 'https://sc.japerz.com/'
  }
]
</script>

<style scoped>
.site-footer {
  padding: 24px 0;
  border-top: 1px solid var(--color-border);
  background: var(--color-footer);
  color: rgba(255, 255, 255, 0.74);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

strong {
  color: var(--color-text);
  font-size: 16px;
}

p {
  margin: 6px 0 0;
  font-size: 13px;
}

.footer-left {
  min-width: 0;
}

.friend-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 12px;
  color: var(--color-text-subtle);
  font-size: 13px;
}

.friend-links span {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
}

.footer-right {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 10px;
}

.footer-links {
  display: flex;
  gap: 18px;
  font-size: 14px;
}

.beian-list {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.beian-link {
  color: var(--color-text-subtle);
  font-size: 13px;
  line-height: 1.5;
}

.friend-links a:hover,
.footer-links a:hover,
.beian-link:hover {
  color: var(--color-primary);
}

@media (max-width: 640px) {
  .footer-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-right {
    align-items: flex-start;
  }

  .beian-list {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
