package plugins

import (
	"replayhq/internal/events"
)

// Plugin is the interface that all plugins must implement.
type Plugin interface {
	// Name returns the name of the plugin.
	Name() string
	// Init initializes the plugin with the given event sink.
	Init(sink func(*events.Event)) error
	// Start starts the plugin.
	Start() error
	// Stop stops the plugin.
	Stop() error
}

// GitPlugin captures git-related events.
type GitPlugin struct{}

// NewGitPlugin creates a new GitPlugin.
func NewGitPlugin() *GitPlugin {
	return &GitPlugin{}
}

func (p *GitPlugin) Name() string { return "git" }
func (p *GitPlugin) Init(sink func(*events.Event)) error { return nil }
func (p *GitPlugin) Start() error { return nil }
func (p *GitPlugin) Stop() error { return nil }

// ShellPlugin captures shell command events.
type ShellPlugin struct{}

// NewShellPlugin creates a new ShellPlugin.
func NewShellPlugin() *ShellPlugin {
	return &ShellPlugin{}
}

func (p *ShellPlugin) Name() string { return "shell" }
func (p *ShellPlugin) Init(sink func(*events.Event)) error { return nil }
func (p *ShellPlugin) Start() error { return nil }
func (p *ShellPlugin) Stop() error { return nil }

// FilesystemPlugin captures file system events.
type FilesystemPlugin struct{}

// NewFilesystemPlugin creates a new FilesystemPlugin.
func NewFilesystemPlugin() *FilesystemPlugin {
	return &FilesystemPlugin{}
}

func (p *FilesystemPlugin) Name() string { return "filesystem" }
func (p *FilesystemPlugin) Init(sink func(*events.Event)) error { return nil }
func (p *FilesystemPlugin) Start() error { return nil }
func (p *FilesystemPlugin) Stop() error { return nil }