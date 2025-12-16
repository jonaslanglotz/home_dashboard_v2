# Edit this configuration file to define what should be installed on
# your system.  Help is available in the configuration.nix(5) man page
# and in the NixOS manual (accessible by running ‘nixos-help’).

{ config, pkgs, ... }:

{
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
    ];

  # Bootloader.
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
  boot.loader.efi.efiSysMountPoint = "/boot/efi";

  networking.hostName = "dashboard"; # Define your hostname.
  # networking.wireless.enable = true;  # Enables wireless support via wpa_supplicant.

  # Configure network proxy if necessary
  # networking.proxy.default = "http://user:password@proxy:port/";
  # networking.proxy.noProxy = "127.0.0.1,localhost,internal.domain";

  # Enable networking
  networking.networkmanager.enable = true;

  # Set your time zone.
  time.timeZone = "Europe/Berlin";

  # Select internationalisation properties.
  i18n.defaultLocale = "en_US.UTF-8";

  i18n.extraLocaleSettings = {
    LC_ADDRESS = "de_DE.UTF-8";
    LC_IDENTIFICATION = "de_DE.UTF-8";
    LC_MEASUREMENT = "de_DE.UTF-8";
    LC_MONETARY = "de_DE.UTF-8";
    LC_NAME = "de_DE.UTF-8";
    LC_NUMERIC = "de_DE.UTF-8";
    LC_PAPER = "de_DE.UTF-8";
    LC_TELEPHONE = "de_DE.UTF-8";
    LC_TIME = "de_DE.UTF-8";
  };

  # Enable the X11 windowing system.
  services.xserver.enable = true;

  # Enable the GNOME Desktop Environment.
  services.xserver.displayManager.gdm.enable = true;
  services.xserver.desktopManager.gnome.enable = true;

  # Configure keymap in X11
  services.xserver = {
    layout = "de";
    xkbVariant = "";
  };

  # Configure console keymap
  console.keyMap = "de";

  # Enable CUPS to print documents.
  services.printing.enable = true;

  # Enable sound with pipewire.
  sound.enable = true;
  hardware.pulseaudio.enable = false;
  security.rtkit.enable = true;
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    alsa.support32Bit = true;
    pulse.enable = true;
    # If you want to use JACK applications, uncomment this
    #jack.enable = true;

    # use the example session manager (no others are packaged yet so this is enabled by default,
    # no need to redefine it in your config for now)
    #media-session.enable = true;
  };

  # Enable touchpad support (enabled default in most desktopManager).
  # services.xserver.libinput.enable = true;

  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.dashboard = {
    isNormalUser = true;
    description = "dashboard";
    extraGroups = [ "networkmanager" "wheel" ];
    packages = with pkgs; [
      firefox
    #  thunderbird
    ];
    shell = pkgs.zsh;
  };

  # Enable automatic login for the user.
  services.xserver.displayManager.autoLogin.enable = true;
  services.xserver.displayManager.autoLogin.user = "dashboard";

  # Workaround for GNOME autologin: https://github.com/NixOS/nixpkgs/issues/103746#issuecomment-945091229
  systemd.services."getty@tty1".enable = false;
  systemd.services."autovt@tty1".enable = false;

  # Allow unfree packages
  nixpkgs.config.allowUnfree = true;

  # List packages installed in system profile. To search, run:
  # $ nix search wget
  environment.systemPackages = with pkgs; [
    vim # Do not forget to add an editor to edit configuration.nix! The Nano editor is also installed by default.
    wget
    git
    tmux
    nodejs
    zsh
    gnomeExtensions.no-overview
    ngrok
  ];

  # List services that you want to enable:

  services.clight = {
    enable = true;
    settings = {
      verbose = true;
      dimmer.disabled = true;
      backlight.ac_timeouts = [3 3 3];
      backlight.batt_timeouts = [3 3 3];
      backlight.shutter_threshold = 0;
    };
  };

  services.unclutter = {
    enable = true;
    timeout = 2;
  };

  systemd.user.extraConfig = ''
    DefaultEnvironment="PATH=/run/current-system/sw/bin"
  '';

  systemd.user.services.dashboard_server = {
    description = "dashboard server autostart";
    path = [ pkgs.nodejs pkgs.coreutils pkgs.bash ];
    script = ''
      echo "cd"
      echo "$PATH"
      cd ~/home_dashboard_v2/server
      echo "start"
      npm run start
    '';
    wantedBy = [ "graphical-session.target" ];
    partOf = [ "graphical-session.target" ];
    serviceConfig.Restart = "always";
    serviceConfig.RestartSec = 5;
  };

  systemd.user.services.dashboard_web = {
    description = "dashboard_web autostart";
    path = [ pkgs.nodejs pkgs.coreutils pkgs.bash ];
    script = ''
      echo "cd"
      echo "$PATH"
      cd ~/home_dashboard_v2/web
      echo "start"
      npm run preview
    '';
    wantedBy = [ "graphical-session.target" ];
    partOf = [ "graphical-session.target" ];
    serviceConfig.Restart = "always";
    serviceConfig.RestartSec = 5;
  };

  systemd.user.services.kiosk = {
    description = "browser autostart";
    serviceConfig.PassEnvironment = "DISPLAY";
    script = "DISPLAY=:0 ${pkgs.firefox}/bin/firefox -kiosk -private-window localhost:4173/david";
    wantedBy = [ "graphical-session.target" ];
    partOf = [ "graphical-session.target" ];
    serviceConfig.Restart = "always";
    serviceConfig.RestartSec = 5;
  };

  systemd.services.ngrok = {
    description = "ngrok autostart";
    path = [ pkgs.coreutils pkgs.bash pkgs.ngrok ];
    script = "ngrok tcp 22 --authtoken 2PCH8KHooh1VZvyIey5z00w7rbV_284r8QxLdtv8TsexQZpmd --log=stdout > /home/dashboard/ngrok.log";
    wantedBy = [ "multi-user.target" ];
    serviceConfig.Restart = "always";
    serviceConfig.RestartSec = 5;
  };

  systemd.services.blank = {
    description = "blank screen";
    script = "/home/dashboard/blank.sh";
    serviceConfig.Type = "oneshot";
    serviceConfig.User = "dashboard";
    serviceConfig.PassEnvironment = ["DBUS_SESSION_BUS_ADDRESS" "XDG_RUNTIME_DIR"];
  };

  systemd.services.unblank = {
    description = "unblank screen";
    script = "/home/dashboard/unblank.sh";
    serviceConfig.Type = "oneshot";
    serviceConfig.User = "dashboard";
    serviceConfig.PassEnvironment = ["DBUS_SESSION_BUS_ADDRESS" "XDG_RUNTIME_DIR"];
  };

  systemd.services.reboot = {
    description = "reboot the system";
    script = "shutdown -r now";
    serviceConfig.Type = "oneshot";
  };

  systemd.timers."reboot" = {
    wantedBy = [ "timers.target" ];
    timerConfig = {
      OnCalendar = "Mon-Sun 02:00:00";
      Unit = "reboot.service";
    };
  };

  # systemd.timers."blank_week" = {
  #   wantedBy = [ "timers.target" ];
  #   timerConfig = {
  #     OnCalendar = "Sun,Mon-Thu 22:00:00";
  #     Unit = "blank.service";
  #   };
  # };

  # systemd.timers."blank_weekend" = {
  #   wantedBy = [ "timers.target" ];
  #   timerConfig = {
  #     OnCalendar = "Fri-Sat 22:00:00";
  #     Unit = "blank.service";
  #   };
  # };

  # systemd.timers."unblank_week" = {
  #   wantedBy = [ "timers.target" ];
  #   timerConfig = {
  #     OnCalendar = "Sat-Sun 03:30:00";
  #     Unit = "unblank.service";
  #   };
  # };

  # systemd.timers."unblank_weekend" = {
  #   wantedBy = [ "timers.target" ];
  #   timerConfig = {
  #     OnCalendar = "Sat-Sun 03:30:00";
  #     Unit = "unblank.service";
  #   };
  # };

  systemd.services.set_blankness = {
    description = "set blankness of screen";
    script = "/home/dashboard/set_blankness.sh";
    serviceConfig.Type = "oneshot";
    serviceConfig.PassEnvironment = ["DBUS_SESSION_BUS_ADDRESS" "XDG_RUNTIME_DIR"];
  };

  systemd.timers."set_blankness" = {
    wantedBy = [ "timers.target" ];
    timerConfig = {
      OnCalendar = "*:0/5:05";
      Unit = "set_blankness.service";
    };
  };

  location.latitude = 53.5405593;
  location.longitude = 13.8536007;

  # Enable the OpenSSH daemon.
  services.openssh = {
    enable = true;
    # passwordAuthentication = false;
    # kbdInteractiveAuthentication = false;
  };

  # Open ports in the firewall.
  # networking.firewall.allowedTCPPorts = [ ... ];
  # networking.firewall.allowedUDPPorts = [ ... ];
  # Or disable the firewall altogether.
  # networking.firewall.enable = false;

  # This value determines the NixOS release from which the default
  # settings for stateful data, like file locations and database versions
  # on your system were taken. It‘s perfectly fine and recommended to leave
  # this value at the release version of the first install of this system.
  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "22.11"; # Did you read the comment?

}
