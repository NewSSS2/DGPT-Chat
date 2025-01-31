import { A, useLocation } from '@solidjs/router'
import {
  Activity,
  Bell,
  Book,
  ChevronRight,
  HeartHandshake,
  HelpCircle,
  LogIn,
  MessageCircle,
  Moon,
  Plus,
  Settings,
  ShoppingBag,
  Sliders,
  Sun,
  VenetianMask,
  X,
} from 'lucide-solid'
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  Match,
  onMount,
  Show,
  Switch,
} from 'solid-js'
import AvatarIcon, { CharacterAvatar } from './shared/AvatarIcon'
import {
  characterStore,
  chatStore,
  inviteStore,
  settingStore,
  toastStore,
  userStore,
} from './store'
import Slot from './shared/Slot'
import { useEffect, useResizeObserver, useWindowSize } from './shared/hooks'
import WizardIcon from './icons/WizardIcon'
import Badge from './shared/Badge'

const MobileNavHeader = () => {
  const user = userStore()
  const suffix = createMemo(() => (user.user?.sub?.level ?? 0 > 0 ? '+' : ''))

  return (
    <div class="flex min-h-[2rem] justify-between sm:hidden">
      <div class="w-8"></div>
      <div>
        {' '}
        <span class="w-full text-center text-[1rem]">
          Dom<span class="text-[var(--hl-500)]">GPT</span>
          {suffix()}
        </span>
      </div>
      <div class="w-8">
        <div class="icon-button">
          <X onClick={settingStore.menu} />
        </div>
      </div>
    </div>
  )
}

const Navigation: Component = () => {
  let parent: any
  let content: any
  const state = settingStore()
  const user = userStore()
  const chat = chatStore()
  const size = useWindowSize()

  const suffix = createMemo(() => (user.user?.sub?.level ?? 0 > 0 ? '+' : ''))

  createEffect(() => {
    if (!state.overlay && state.showMenu) {
      settingStore.menu()
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (!parent || !content) return

      parent.setAttribute('style', '')
      content.setAttribute('style', '')
    }, 50)

    return () => clearInterval(interval)
  })

  const hide = createMemo(() => {
    if (!!chat.opts.pane && !state.showMenu) return 'drawer--hide'
    if (state.showMenu) return ''
    return 'drawer--hide'
  })

  const fullscreen = createMemo(() => {
    if (state.fullscreen) return 'hidden'

    if (chat.opts.pane && size.width() <= 1200) {
      return 'hidden'
    }

    return ''
  })

  return (
    <>
      <div
        ref={parent}
        class={`drawer bg-800 flex flex-col gap-2 px-2 pt-2 ${hide()} ${fullscreen()}`}
        role="navigation"
        aria-label="Main"
      >
        <div ref={content} class="drawer__content sm:text-md text-md flex flex-col gap-0  sm:gap-1">
          <div class="hidden w-full items-center justify-center sm:flex">
            <A href="/" role="link" aria-label="DomGPT Chat main page">
              <div
                class="h-8 w-fit items-center justify-center rounded-lg font-bold"
                aria-hidden="true"
              >
                Dom<span class="text-[var(--hl-500)]">GPT</span>
                {suffix()}
              </div>
            </A>
          </div>

          <MobileNavHeader />

          <Show when={user.loggedIn} fallback={<GuestNavigation />}>
            <UserNavigation />
          </Show>
        </div>

        <div
          class="absolute bottom-0 flex w-full flex-col items-center justify-between px-4"
          classList={{
            'h-8': state.config.policies,
            'h-4': !state.config.policies,
          }}
        >
          <Show when={state.config.policies}>
            <div class="text-500 flex w-full justify-center gap-4 text-xs">
              <div>
                <A href="/terms-of-service">Term of Service</A>
              </div>
              <div>
                <A href="/privacy-policy">Privacy Policy</A>
              </div>
            </div>
          </Show>
          <div class="text-500 mb-1 text-[0.6rem] italic">{state.config.version}</div>
        </div>
      </div>
    </>
  )
}

const UserNavigation: Component = () => {
  const user = userStore()
  const menu = settingStore()
  const toasts = toastStore()
  const invites = inviteStore()

  const count = createMemo(() => {
    return toasts.unseen + invites.invites.length
  })

  return (
    <>
      <UserProfile />

      <Show when={menu.flags.chub}>
        <Item href="/chub" ariaLabel="Character hub">
          <ShoppingBag aria-hidden="true" />
          CHUB
        </Item>
      </Show>

      <CharacterLink />

      <ChatLink />

      <Library />
      <Show when={user.user?.admin}>
        <Item href="/admin/metrics">
          <Activity /> Manage
        </Item>
        <SubMenu>
          <SubItem href="/admin/users" parent="/admin/">
            Users
          </SubItem>
          <SubItem href="/admin/subscriptions" parent="/admin/">
            Subscriptions
          </SubItem>
          <SubItem href="/admin/announcements" parent="/admin/">
            Announcements
          </SubItem>
        </SubMenu>
      </Show>

      <div class="flex flex-wrap justify-center gap-[2px] text-sm">
        <Show when={menu.config.patreon}>
          <ExternalLink href="https://patreon.com/SubspaceStudios" newtab>
            <HeartHandshake />
          </ExternalLink>
        </Show>
        <Item href="/settings">
          <Settings />
        </Item>

        <Item
          onClick={() => {
            userStore.saveUI({ mode: user.ui.mode === 'light' ? 'dark' : 'light' })
          }}
        >
          <Show when={user.ui.mode === 'dark'} fallback={<Sun />}>
            <Moon />
          </Show>
        </Item>

        <Item
          onClick={() => {
            if (menu.showMenu) settingStore.closeMenu()
            toastStore.modal(true)
          }}
        >
          <Switch>
            <Match when={count() > 0}>
              <div class="relative flex">
                <Bell fill="var(--bg-100)" />
                <span class="absolute bottom-[-0.5rem] right-[-0.5rem]">
                  <Badge>{count() > 9 ? '9+' : count()}</Badge>
                </span>
              </div>
            </Match>

            <Match when={!count()}>
              <Bell color="var(--bg-500)" />
            </Match>
          </Switch>
        </Item>
      </div>

      <Slots />
    </>
  )
}

const GuestNavigation: Component = () => {
  const toasts = toastStore()
  const user = userStore()
  const menu = settingStore((s) => ({
    showMenu: s.showMenu,
    config: s.config,
    guest: s.guestAccessAllowed,
    flags: s.flags,
  }))

  return (
    <>
      <Show when={menu.config.canAuth}>
        <Item href="/login" ariaLabel="Login to the application">
          <LogIn aria-hidden="true" /> Login
        </Item>
      </Show>

      <Show when={menu.guest}>
        <UserProfile />

        <CharacterLink />

        <Show when={menu.flags.chub}>
          <Item href="/chub" ariaLabel="Character hub">
            <ShoppingBag aria-hidden="true" />
            CHUB
          </Item>
        </Show>

        <ChatLink />

        <Library />
      </Show>

      <div class="flex flex-wrap justify-center gap-[2px] text-sm">
        <Show when={menu.config.patreon}>
          <ExternalLink href="https://patreon.com/subspacestudios" newtab>
            <HeartHandshake aria-hidden="true" />
          </ExternalLink>
        </Show>

        <Item href="/settings" ariaLabel="Open settings page">
          <Settings aria-hidden="true" />
        </Item>

        <Item
          ariaLabel="Toggle between light and dark mode"
          onClick={() => {
            userStore.saveUI({ mode: user.ui.mode === 'light' ? 'dark' : 'light' })
          }}
        >
          <Show when={user.ui.mode === 'dark'} fallback={<Sun />}>
            <Moon aria-hidden="true" />
          </Show>
        </Item>

        <Item
          onClick={() => {
            if (menu.showMenu) settingStore.closeMenu()
            toastStore.modal(true)
          }}
          ariaLabel="Show notification list"
        >
          <Switch>
            <Match when={toasts.unseen > 0}>
              <div
                class="relative flex"
                role="status"
                aria-label={`Status: You have ${toasts.unseen} new notifications`}
              >
                <Bell fill="var(--bg-100)" aria-hidden="true" />
                <span class="absolute bottom-[-0.5rem] right-[-0.5rem]" aria-hidden="true">
                  <Badge>{toasts.unseen > 9 ? '9+' : toasts.unseen}</Badge>
                </span>
              </div>
            </Match>

            <Match when={!toasts.unseen}>
              <Bell color="var(--bg-500)" role="status" aria-label="Status: No new notifications" />
            </Match>
          </Switch>
        </Item>
      </div>

      <Slots />
    </>
  )
}

const Item: Component<{
  href?: string
  ariaLabel?: string
  children: string | JSX.Element
  onClick?: () => void
}> = (props) => {
  const menu = settingStore()
  return (
    <>
      <Show when={!props.href}>
        <div
          class="flex min-h-[2.5rem] cursor-pointer items-center justify-start gap-4 rounded-lg px-2 hover:bg-[var(--bg-700)] sm:min-h-[2.5rem]"
          onClick={() => {
            if (props.onClick) props.onClick()
            else if (menu.showMenu) settingStore.closeMenu()
          }}
          tabindex={0}
          role="button"
          aria-label={props.ariaLabel}
        >
          {props.children}
        </div>
      </Show>
      <Show when={props.href}>
        <A
          href={props.href!}
          class="flex min-h-[2.5rem] items-center justify-start gap-4 rounded-lg px-2 hover:bg-[var(--bg-700)] sm:min-h-[2.5rem]"
          onClick={() => {
            if (menu.showMenu) settingStore.closeMenu()
          }}
          role="button"
          aria-label={props.ariaLabel}
        >
          {props.children}
        </A>
      </Show>
    </>
  )
}

const SubMenu: Component<{ children: any }> = (props) => <div class="bg-900">{props.children}</div>

const SubItem: Component<{
  parent: string
  href: string
  children: string | JSX.Element
  onClick?: () => void
}> = (props) => {
  const menu = settingStore()
  const loc = useLocation()
  return (
    <Show when={loc.pathname.startsWith(props.parent)}>
      <A
        activeClass="bg-[var(--hl-900)]"
        href={props.href!}
        class="flex min-h-[2.5rem] items-center justify-start gap-4 rounded-lg px-2 pl-4 hover:bg-[var(--bg-700)] sm:min-h-[2.5rem]"
        onClick={() => {
          if (menu.showMenu) settingStore.closeMenu()
        }}
      >
        <ChevronRight size={14} /> {props.children}
      </A>
    </Show>
  )
}

export default Navigation

const ExternalLink: Component<{ href: string; newtab?: boolean; children?: any }> = (props) => (
  <a
    class="flex h-10 items-center justify-start gap-4 rounded-xl px-2 hover:bg-[var(--bg-700)] sm:h-12"
    href={props.href}
    target={props.newtab ? '_blank' : ''}
  >
    {props.children}
  </a>
)

const Library: Component<{}> = (props) => {
  return (
    <div class="grid w-full gap-2" style={{ 'grid-template-columns': '1fr 30px' }}>
      <Item href="/memory" ariaLabel="Library">
        <Book aria-hidden="true" />
        <span aria-hidden="true"> Library </span>
      </Item>
    </div>
  )
}

const CharacterLink = () => {
  return (
    <MultiItem>
      <Item href="/character/list" ariaLabel="Characters">
        <WizardIcon aria-hidden="true" />
        <span aria-hidden="true"> Characters </span>
      </Item>
      <EndItem>
        <A class="icon-button" href="/editor" role="button" aria-label="Add a new character">
          <Plus aria-hidden="true" />
        </A>
      </EndItem>
    </MultiItem>
  )
}

const ChatLink = () => {
  return (
    <MultiItem>
      <Item href="/chats" ariaLabel="Chats">
        <MessageCircle fill="var(--bg-100)" aria-hidden="true" />
        <span aria-hidden="true"> Chats </span>
      </Item>
      <EndItem>
        <A class="icon-button" href="/chats/create" role="button" aria-label="Create a new chat">
          <Plus aria-hidden="true" />
        </A>
      </EndItem>
    </MultiItem>
  )
}

const UserProfile = () => {
  const chars = characterStore()
  const user = userStore()
  const menu = settingStore()

  return (
    <>
      <div
        class="grid w-full items-center justify-between gap-2"
        style={{
          'grid-template-columns': '1fr 30px',
        }}
      >
        <Item
          ariaLabel="Edit user profile"
          onClick={() => {
            if (menu.showMenu) settingStore.closeMenu()
            userStore.modal(true)
          }}
        >
          <Switch>
            <Match when={chars.impersonating}>
              <CharacterAvatar
                char={chars.impersonating!}
                format={{ corners: 'circle', size: 'xs' }}
              />
            </Match>

            <Match when>
              <AvatarIcon
                avatarUrl={chars.impersonating?.avatar || user.profile?.avatar}
                format={{ corners: 'circle', size: 'xs' }}
              />
            </Match>
          </Switch>
          <span aria-hidden="true">{chars.impersonating?.name || user.profile?.handle}</span>
        </Item>
        <div class="flex items-center">
          <a
            href="#"
            role="button"
            aria-label="Open impersonation menu"
            class="icon-button"
            onClick={() => {
              settingStore.toggleImpersonate(true)
              if (menu.showMenu) settingStore.closeMenu()
            }}
          >
            <VenetianMask aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  )
}

const MultiItem: Component<{ children: any }> = (props) => {
  return (
    <div class="grid w-full gap-2" style={{ 'grid-template-columns': '1fr 30px' }}>
      {props.children}
    </div>
  )
}

const EndItem: Component<{ children: any }> = (props) => {
  return <div class="flex items-center">{props.children}</div>
}

const Slots: Component = (props) => {
  let ref: HTMLDivElement
  const state = settingStore()
  const { load } = useResizeObserver()

  onMount(() => {
    load(ref)
  })

  const [rendered, setRendered] = createSignal(false)

  createEffect(() => {
    if (rendered()) return

    if (state.showMenu) {
      setTimeout(() => setRendered(true), 500)
    }
  })

  return (
    <div ref={ref!} class="h-full w-full">
      <Slot parent={ref!} slot="menu" />
    </div>
  )
}
