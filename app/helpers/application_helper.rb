module ApplicationHelper
  def icon(name, options = {})
    # Use SVG icons from Tabler Icons (inline SVG)
    # In production, you would use rails_icons gem or load from assets
    content_tag :svg, options.merge(
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    ) do
      case name
      when "tabler/settings"
        '<path d="M12 20a8 8 0 1 0 0 -16a8 8 0 0 0 0 16z"></path><path d="M12 14a2 2 0 1 0 0 -4a2 2 0 0 0 0 4z"></path><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M17.24 17.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83 -2.83"></path><path d="M17.24 6.76l2.83 -2.83"></path>'.html_safe
      when "tabler/alert-triangle"
        '<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>'.html_safe
      when "tabler/cloud-upload"
        '<path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1"></path><path d="M9 15l3 -3l3 3"></path><path d="M12 12l0 9"></path>'.html_safe
      when "tabler/zoom-in"
        '<circle cx="10" cy="10" r="7"></circle><path d="M7 10l6 0"></path><path d="M10 7l0 6"></path><path d="M21 21l-6 -6"></path>'.html_safe
      when "tabler/zoom-out"
        '<circle cx="10" cy="10" r="7"></circle><path d="M7 10l6 0"></path><path d="M21 21l-6 -6"></path>'.html_safe
      when "tabler/arrows-maximize"
        '<path d="M16 4l4 0l0 4"></path><path d="M14 10l6 -6"></path><path d="M8 20l-4 0l0 -4"></path><path d="M4 20l6 -6"></path><path d="M16 20l4 0l0 -4"></path><path d="M14 14l6 6"></path><path d="M8 4l-4 0l0 4"></path><path d="M4 4l6 6"></path>'.html_safe
      when "tabler/chevron-left"
        '<path d="M15 6l-6 6l6 6"></path>'.html_safe
      when "tabler/chevron-right"
        '<path d="M9 6l6 6l-6 6"></path>'.html_safe
      when "tabler/copy"
        '<rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>'.html_safe
      when "tabler/download"
        '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path><path d="M7 11l5 5l5 -5"></path><path d="M12 4l0 12"></path>'.html_safe
      else
        ""
      end
    end
  end
end
