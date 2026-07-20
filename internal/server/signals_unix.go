//go:build unix

package server

import (
	"os"
	"syscall"
)

// unix_sigterm returns SIGTERM in a form that satisfies os.Signal.
func unix_sigterm() os.Signal { return syscall.SIGTERM }

// unix_sigkill returns SIGKILL in a form that satisfies os.Signal.
func unix_sigkill() os.Signal { return syscall.SIGKILL }
