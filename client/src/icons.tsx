import {
  Award,
  Briefcase,
  Calendar,
  Cloud,
  Code2,
  ExternalLink,
  Github,
  GraduationCap,
  Gauge,
  LayoutTemplate,
  Linkedin,
  Mail,
  MapPin,
  Monitor,
  Palette,
  Phone,
  Rocket,
  Server,
  Sparkles,
  Trophy,
  Twitter,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'

const icons: Record<string, ComponentType<{ size?: number | string; className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  mail: Mail,
  layout: LayoutTemplate,
  server: Server,
  palette: Palette,
  gauge: Gauge,
  monitor: Monitor,
  cloud: Cloud,
  briefcase: Briefcase,
  calendar: Calendar,
  award: Award,
  education: GraduationCap,
  code: Code2,
  map: MapPin,
  phone: Phone,
  external: ExternalLink,
  sparkles: Sparkles,
  rocket: Rocket,
  trophy: Trophy,
  users: Users,
}

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const Cmp = icons[name] || Code2
  return <Cmp size={size} />
}

export { Github, Linkedin, Twitter, Mail, MapPin, Phone, Calendar, ExternalLink }
