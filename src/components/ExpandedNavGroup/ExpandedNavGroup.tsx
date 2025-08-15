'use client'
import type { NavPreferences } from 'payload'
import type { PayloadFolderTreeViewConfig } from 'src/index.js'

import { AnimateHeight, ChevronIcon, Link, useNav, usePreferences } from '@payloadcms/ui'

import './styles.scss'

import React, { useState } from 'react'

import type { File } from "../../types.js"

import { fetchFilesFromEndpoint } from '../../lib/fetchFilesFromEndpoint.js'

const baseClass = 'nav-group'
const ftvClass = 'folder-tree-view'

type Props = {
  children: React.ReactNode
  folderId: string;
  isOpen?: boolean
  label: string
  pluginConfig: PayloadFolderTreeViewConfig
}

const preferencesKey = 'payload-folder-tree-view'

/**
 * Expanded navigation group component.
 *
 * Extends payloadcms/ui base "NavGroup" component for folder tree view.
 */
export const ExpandedNavGroup: React.FC<Props> = ({ children, folderId, isOpen: isOpenFromProps, label, pluginConfig }) => {
  const [collapsed, setCollapsed] = useState(
    typeof isOpenFromProps !== 'undefined' ? !isOpenFromProps : false,
  )

  const [animate, setAnimate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const { setPreference } = usePreferences()
  const { navOpen } = useNav()

  if (label) {
    const toggleCollapsed = async () => {
      if (!React.isValidElement(children)) {
        return;
      }

      setAnimate(true)
      const newGroupPrefs: NavPreferences['groups'] = {}

      if (!newGroupPrefs?.[label]) {
        newGroupPrefs[label] = { open: Boolean(collapsed) }
      } else {
        newGroupPrefs[label].open = Boolean(collapsed)
      }

      void setPreference(preferencesKey, { groups: newGroupPrefs }, true)
      setCollapsed(!collapsed)

      if (folderId !== "root" && collapsed && pluginConfig.showFiles) {
        setLoading(true);
        const files = await fetchFilesFromEndpoint(folderId)
        setFiles(files);
        setLoading(false);
      } else {
        setFiles([]);
      }
    }

    const linkPressed = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      e.stopPropagation();
    }

    return (
      <div
        className={[`${baseClass} ${ftvClass}`, `${label}`, collapsed && `${baseClass}--collapsed`]
          .filter(Boolean)
          .join(' ')}
        id={`nav-group-${label}`}
      >
        <button
          className={[
            `${baseClass}__toggle`,
            `${baseClass}__toggle--${collapsed ? 'collapsed' : 'open'}`,
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={toggleCollapsed}
          tabIndex={!navOpen ? -1 : 0}
          type="button"
        >
          <Link className={`${baseClass}__label`} href={`/admin/browse-by-folder/${folderId === "root" ? '' : folderId}`} onClick={linkPressed}>{label}</Link>
          {React.isValidElement(children) && (
            <div className={`${baseClass}__indicator`}>
              <ChevronIcon
                className={`${baseClass}__indicator`}
                direction={!collapsed ? 'up' : undefined}
              />
            </div>
          )}

        </button>
        <AnimateHeight duration={animate ? 300 : 0} height={collapsed ? 0 : 'auto'}>
          <div className={`${baseClass}__content`}>
            {children}
            {loading && (
              <p>Loading...</p>
            )}
            {files && (
              <ul className={`${baseClass}__files`}>
                {files.map((file) => {
                  return (
                    <li key={file.id}>
                      <Link className={`${baseClass}__file`} href={`/admin/collections/${file.relationTo}/${file.id}`}>
                        {file.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </AnimateHeight>
      </div>
    )
  }

  return <React.Fragment>{children}</React.Fragment>
}