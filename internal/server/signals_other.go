//go:build !unix

package server

import "os"

// On non-unix platforms we fall back to os.Interrupt / os.Kill which are
// the closest equivalents in the os.Signal type. The desktop client is
// Linux/macOS/Windows; this file keeps the package building everywhere.
func unix_sigterm() os.Signal { return os.Interrupt }
func unix_sigkill() os.Signal { return os.Kill }
