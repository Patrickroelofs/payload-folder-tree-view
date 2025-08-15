'use client'
import type { NavPreferences } from 'payload'

import { AnimateHeight, ChevronIcon, Link, useNav, usePreferences } from '@payloadcms/ui'
import React, { useState } from 'react'

import './styles.scss'

const baseClass = 'nav-group'
const ftvClass = 'folder-tree-view'

type Props = {
  children: React.ReactNode
  folderId: string;
  isOpen?: boolean
  label: string
}

const preferencesKey = 'nav'

/**
 * Expanded navigation group component.
 *
 * Extends payloadcms/ui base "NavGroup" component for folder tree view.
 */
export const ExpandedNavGroup: React.FC<Props> = ({ children, folderId, isOpen: isOpenFromProps, label }) => {
  const [collapsed, setCollapsed] = useState(
    typeof isOpenFromProps !== 'undefined' ? !isOpenFromProps : false,
  )

  const [animate, setAnimate] = useState(false)
  const { setPreference } = usePreferences()
  const { navOpen } = useNav()

  if (label) {
    const toggleCollapsed = () => {
      setAnimate(true)
      const newGroupPrefs: NavPreferences['groups'] = {}

      if (!newGroupPrefs?.[label]) {
        newGroupPrefs[label] = { open: Boolean(collapsed) }
      } else {
        newGroupPrefs[label].open = Boolean(collapsed)
      }

      void setPreference(preferencesKey, { groups: newGroupPrefs }, true)
      setCollapsed(!collapsed)
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
          <div className={`${baseClass}__indicator`}>
            <ChevronIcon
              className={`${baseClass}__indicator`}
              direction={!collapsed ? 'up' : undefined}
            />
          </div>
        </button>
        <AnimateHeight duration={animate ? 200 : 0} height={collapsed ? 0 : 'auto'}>
          <div className={`${baseClass}__content`}>{children}</div>
        </AnimateHeight>
      </div>
    )
  }

  return <React.Fragment>{children}</React.Fragment>
}