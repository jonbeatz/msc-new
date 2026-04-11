"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

const TOGGLE_CLASS = "msc-payload-login-password__toggle"
const FIELD_CLASS = "msc-payload-login-password-field"

function isAdminLoginPath(pathname: string | null): boolean {
  if (!pathname) return false
  return /\/admin\/login\/?$/.test(pathname)
}

function attachToggleToField(pwd: HTMLInputElement) {
  const wrap = pwd.parentElement
  if (!wrap || wrap.querySelector(`.${TOGGLE_CLASS}`)) return

  wrap.classList.add(FIELD_CLASS)

  const btn = document.createElement("button")
  btn.type = "button"
  btn.className = TOGGLE_CLASS
  btn.setAttribute("aria-label", "Show password")
  btn.innerHTML = `<span class="msc-payload-login-password__icon" aria-hidden="true">${eyeOpenSvg}</span>`

  let visible = false
  btn.addEventListener("click", () => {
    visible = !visible
    pwd.type = visible ? "text" : "password"
    btn.setAttribute("aria-label", visible ? "Hide password" : "Show password")
    wrap.classList.toggle("msc-payload-login-password-field--visible", visible)
    btn.innerHTML = `<span class="msc-payload-login-password__icon" aria-hidden="true">${
      visible ? eyeOffSvg : eyeOpenSvg
    }</span>`
  })

  pwd.insertAdjacentElement("afterend", btn)
}

function enhanceLoginPasswordFields() {
  if (typeof document === "undefined") return

  const forms = document.querySelectorAll("form")
  for (const form of forms) {
    const pwd = form.querySelector<HTMLInputElement>("input[type='password']")
    if (!pwd) continue

    const emailLike = form.querySelector(
      'input[type="email"], input[name="email"], input#field-email',
    )
    if (!emailLike) continue

    attachToggleToField(pwd)
  }
}

const eyeOpenSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`

const eyeOffSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`

/**
 * Wraps the admin tree to add a password visibility control on `/admin/login`.
 * The virtual auth password field is not configurable via `collections/Users` the way a normal field is;
 * we enhance the rendered DOM without reparenting React-controlled nodes.
 */
export function MscPayloadAdminEnhancements({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    if (!isAdminLoginPath(pathname)) return

    const run = () => enhanceLoginPasswordFields()
    run()

    const obs = new MutationObserver(() => {
      run()
    })
    obs.observe(document.body, { childList: true, subtree: true })

    return () => obs.disconnect()
  }, [pathname])

  return <>{children}</>
}
