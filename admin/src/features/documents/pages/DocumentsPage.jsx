import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/tables/Table';
import { Pagination } from '../../../components/tables/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { usePagination } from '../../../hooks/usePagination';
import { useToast } from '../../../hooks/useToast';
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDownload,
  FiCheck,
  FiX,
} from 'react-icons/fi';

export const DocumentsPage = () => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [documents, setDocuments] = useState([
    { id: 'doc_01', staffName: 'John Smith', docType: 'National ID (Aadhaar / Passport)', uploadDate: '12 Aug 2026', expiryDate: '12 Aug 2031', status: 'Verified' },
    { id: 'doc_02', staffName: 'Sarah Wilson', docType: 'Police Clearance Certificate', uploadDate: '08 Aug 2026', expiryDate: '08 Aug 2027', status: 'Pending' },
    { id: 'doc_03', staffName: 'Michael Brown', docType: 'Medical Fitness Certificate', uploadDate: '02 Aug 2026', expiryDate: '02 Aug 2027', status: 'Missing' },
    { id: 'doc_04', staffName: 'Emily Davis', docType: 'First Aid Certification', uploadDate: '28 Jul 2026', expiryDate: '28 Jul 2028', status: 'Verified' },
    { id: 'doc_05', staffName: 'David Miller', docType: 'Bank Account & Payroll Mandate', uploadDate: '21 Jul 2026', expiryDate: 'N/A', status: 'Pending' },
  ]);

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.staffName.toLowerCase().includes(search.toLowerCase()) ||
      d.docType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? d.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const { currentPage, totalPages, currentData, goToPage, totalItems, itemsPerPage } = usePagination(filteredDocs, 5);

  const handleUpdateStatus = (id, newStatus) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    toast.success(`Document status updated to ${newStatus}`);
  };

  const columns = [
    {
      header: 'Staff Member',
      key: 'staffName',
      render: (name) => <span className="font-bold text-slate-900">{name}</span>,
    },
    {
      header: 'Document Type',
      key: 'docType',
      render: (type) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <FiFileText size={15} className="text-blue-600 shrink-0" />
          <span>{type}</span>
        </div>
      ),
    },
    {
      header: 'Upload Date',
      key: 'uploadDate',
      render: (date) => <span className="text-xs text-slate-500">{date}</span>,
    },
    {
      header: 'Expiry Date',
      key: 'expiryDate',
      render: (date) => <span className="text-xs font-medium text-slate-700">{date}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="outline" size="sm" icon={FiDownload}>
            Download
          </Button>
          {row.status === 'Pending' && (
            <>
              <Button variant="secondary" size="sm" icon={FiCheck} onClick={() => handleUpdateStatus(row.id, 'Verified')}>
                Approve
              </Button>
              <Button variant="danger" size="sm" icon={FiX} onClick={() => handleUpdateStatus(row.id, 'Rejected')}>
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Document Management"
        subtitle="Review, verify, approve, and track staff compliance documents and IDs."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Uploads" value="482" icon={FiFileText} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Verified Docs" value="412" icon={FiCheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Pending Review" value="48" icon={FiClock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Rejected / Missing" value="22" icon={FiXCircle} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>

      <Card padding="p-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by staff name or document type..."
            className="w-full sm:w-80"
          />
          <Select
            placeholder="All Status"
            options={['Verified', 'Pending', 'Missing', 'Rejected']}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <Table columns={columns} data={currentData} keyField="id" />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
        />
      </Card>
    </div>
  );
};
