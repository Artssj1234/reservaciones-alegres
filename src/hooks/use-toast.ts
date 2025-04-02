import * as React from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        if (toastTimeouts.has(toastId)) {
          clearTimeout(toastTimeouts.get(toastId))
          toastTimeouts.delete(toastId)
        }
      } else {
        for (const [id, timeout] of toastTimeouts.entries()) {
          clearTimeout(timeout)
          toastTimeouts.delete(id)
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const useToast = () => {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  })

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open === false && !toastTimeouts.has(toast.id)) {
        const timeoutId = setTimeout(() => {
          dispatch({
            type: actionTypes.REMOVE_TOAST,
            toastId: toast.id,
          })
        }, TOAST_REMOVE_DELAY)

        toastTimeouts.set(toast.id, timeoutId)
      }
    })
  }, [state.toasts])

  const toast = React.useCallback(
    ({ ...props }: Omit<ToasterToast, "id">) => {
      const id = genId()

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
        },
      })

      return id
    },
    [dispatch]
  )

  const update = React.useCallback(
    (props: Partial<ToasterToast>) => {
      if (!props.id) return

      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: props,
      })
    },
    [dispatch]
  )

  const dismiss = React.useCallback(
    (toastId?: string) => {
      dispatch({
        type: actionTypes.DISMISS_TOAST,
        toastId,
      })
    },
    [dispatch]
  )

  return {
    toasts: state.toasts,
    toast,
    dismiss,
    update,
  }
}

type ToastContextType = ReturnType<typeof useToast>

const ToastContext = React.createContext<ToastContextType | null>(null)

function ToastProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const value = useToast()
  
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  )
}

function useToastContext(): ToastContextType {
  const context = React.useContext(ToastContext)
  
  if (context === null) {
    throw new Error("useToast must be used within ToastProvider")
  }
  
  return context
}

export {
  type ToasterToast,
  ToastProvider,
  useToast,
  useToastContext,
}
