'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Search, Loader2, Sparkles, Building2, Layers, HelpCircle, CheckCircle2, AlertCircle, Clock, Eye, Mail, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Inquiry {
  id: string
  name: string
  email: string
  category: 'training_center' | 'assessment_center' | 'general'
  message: string
  status: 'pending' | 'in_progress' | 'resolved'
  created_at: string
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [])

  async function fetchInquiries() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/inquiries')
      if (!res.ok) throw new Error('Failed to fetch inquiries')
      const data = await res.json()
      setInquiries(data)
    } catch {
      toast.error('Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update status')
      }

      toast.success('Inquiry status updated')
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
      )
      
      // Update selected inquiry modal state if open
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => prev ? { ...prev, status: newStatus as any } : null)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 gap-1 rounded-full border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 gap-1 rounded-full border-amber-200">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 gap-1 rounded-full border-blue-200">
            <AlertCircle className="w-3.5 h-3.5" /> Pending
          </Badge>
        )
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'training_center':
        return (
          <Badge variant="outline" className="gap-1 rounded-full border-blue-200 dark:border-blue-800">
            <Building2 className="w-3.5 h-3.5 text-blue-500" /> Training Center
          </Badge>
        )
      case 'assessment_center':
        return (
          <Badge variant="outline" className="gap-1 rounded-full border-violet-200 dark:border-violet-800">
            <Layers className="w-3.5 h-3.5 text-violet-500" /> Assessment Center
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1 rounded-full border-slate-200 dark:border-slate-800">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> General
          </Badge>
        )
    }
  }

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'training_center':
        return 'Training Centers'
      case 'assessment_center':
        return 'Assessment Centers'
      default:
        return 'General Inquiries'
    }
  }

  const uniqueCategories = Array.from(new Set(inquiries.map((item) => item.category)))
  const showCategoryFilter = uniqueCategories.length > 1

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Inquiries</h2>
          <p className="text-sm text-muted-foreground">Manage and respond to client inquiries sent via the chatbot</p>
        </div>
        <Button onClick={fetchInquiries} disabled={loading} variant="outline" className="shrink-0 gap-2 rounded-xl">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-4">
        {/* Filters */}
        <div className="md:col-span-6 lg:col-span-5 relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground/80" />
          <Input
            placeholder="Search by name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        <div className="md:col-span-3 lg:col-span-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showCategoryFilter && (
          <div className="md:col-span-3 lg:col-span-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Filter Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="training_center">Training Centers</SelectItem>
                <SelectItem value="assessment_center">Assessment Centers</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card className="border border-border/40 shadow-xs rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading inquiries...</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/80">
                <HelpCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base">No inquiries found</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  There are no client inquiries matching the active search or filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[180px]">Client</TableHead>
                    <TableHead className="w-[150px]">Category</TableHead>
                    <TableHead>Message Preview</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[140px] text-right">Date Received</TableHead>
                    <TableHead className="w-[200px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-sm">{inquiry.name}</div>
                        <div className="text-xs text-muted-foreground">{inquiry.email}</div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(inquiry.category)}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-xs leading-relaxed text-foreground/90 truncate max-w-[280px]">
                          {inquiry.message}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedInquiry(inquiry)}
                            className="text-xs rounded-lg h-8 gap-1 hover:bg-muted"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                          {inquiry.status !== 'resolved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(inquiry.id, 'resolved')}
                              className="text-xs rounded-lg h-8 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600 dark:border-emerald-950 dark:hover:bg-emerald-950/20"
                            >
                              Resolve
                            </Button>
                          )}
                          {inquiry.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(inquiry.id, 'in_progress')}
                              className="text-xs rounded-lg h-8 border-amber-200 hover:bg-amber-50 hover:text-amber-700 text-amber-600 dark:border-amber-950 dark:hover:bg-amber-950/20"
                            >
                              In Progress
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inquiry Detail Dialog */}
      <Dialog open={selectedInquiry !== null} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        {selectedInquiry && (
          <DialogContent className="sm:max-w-[550px] rounded-2xl">
            <DialogHeader className="space-y-1.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold">Inquiry Details</DialogTitle>
                {getCategoryBadge(selectedInquiry.category)}
              </div>
              <DialogDescription>
                Review client message and update resolution status below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Client Name</span>
                  <span className="font-semibold text-foreground">{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Email Address</span>
                  <span className="font-semibold text-foreground">{selectedInquiry.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Date Received</span>
                  <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(selectedInquiry.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Inquiry Status</span>
                  <div className="mt-0.5">{getStatusBadge(selectedInquiry.status)}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Message</span>
                <div className="bg-white dark:bg-muted border border-border/60 p-4 rounded-xl text-xs leading-relaxed text-foreground whitespace-pre-wrap max-h-[180px] overflow-y-auto font-mono">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center w-full border-t border-border/30 pt-4">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: TESDA Inquiry - ${getCategoryLabel(selectedInquiry.category)}`}
                className="w-full sm:w-auto"
              >
                <Button variant="default" className="w-full h-10 gap-2 rounded-xl">
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </Button>
              </a>

              <div className="flex gap-2 w-full sm:w-auto">
                {selectedInquiry.status !== 'resolved' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedInquiry.id, 'resolved')}
                    className="flex-1 sm:flex-initial h-10 border-emerald-250 hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600 dark:hover:bg-emerald-950/20 rounded-xl"
                  >
                    Mark Resolved
                  </Button>
                )}
                {selectedInquiry.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedInquiry.id, 'in_progress')}
                    className="flex-1 sm:flex-initial h-10 border-amber-250 hover:bg-amber-50 hover:text-amber-700 text-amber-600 dark:hover:bg-amber-950/20 rounded-xl"
                  >
                    In Progress
                  </Button>
                )}
                {selectedInquiry.status === 'resolved' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedInquiry.id, 'pending')}
                    className="flex-1 sm:flex-initial h-10 rounded-xl"
                  >
                    Reopen
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setSelectedInquiry(null)}
                  className="flex-1 sm:flex-initial h-10 rounded-xl"
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
